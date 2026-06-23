import "server-only";
import { prisma } from "@/lib/db";
import { signCallback } from "@/lib/gateway";

export interface PaidCallbackBody {
  event: "order.paid";
  reference: string;
  order_id: string | null;
  status: "paid";
  amount: number;
  currency: string;
  pay_currency: string | null;
  pay_amount: number | null;
  actually_paid: number | null;
  customer_email: string | null;
  paid_at: string | null;
}

async function postWithTimeout(
  url: string,
  body: string,
  headers: Record<string, string>,
  timeoutMs = 8000
): Promise<{ ok: boolean; status: number; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body,
      signal: ctrl.signal,
      cache: "no-store",
    });
    const text = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Notify the originating client site that an order is paid. Signs the body with
 * the site's apiSecret (HMAC-SHA256) and records the delivery outcome on the
 * order. Safe to call multiple times (e.g. manual retry from admin).
 */
export async function dispatchPaidCallback(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { site: true },
  });
  if (!order) return;

  const callbackUrl = order.callbackUrl || order.site?.callbackUrl || null;
  if (!order.site || !callbackUrl) {
    // Nothing to notify (hosted-link order, or no endpoint configured).
    await prisma.order.update({
      where: { id: order.id },
      data: { callbackStatus: "NA" },
    });
    return;
  }

  const body: PaidCallbackBody = {
    event: "order.paid",
    reference: order.reference,
    order_id: order.externalOrderId,
    status: "paid",
    amount: Number(order.amount),
    currency: order.currency,
    pay_currency: order.payCurrency,
    pay_amount: order.payAmount != null ? Number(order.payAmount) : null,
    actually_paid: order.actuallyPaid != null ? Number(order.actuallyPaid) : null,
    customer_email: order.payerEmail,
    paid_at: order.paidAt ? order.paidAt.toISOString() : null,
  };
  const raw = JSON.stringify(body);
  const headers = {
    "x-card2pay-signature": `sha256=${signCallback(order.site.apiSecret, raw)}`,
    "x-card2pay-apikey": order.site.apiKey,
    "x-card2pay-event": body.event,
  };

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await postWithTimeout(callbackUrl, raw, headers);
      if (res.ok) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            callbackStatus: "SENT",
            callbackAttempts: { increment: 1 },
            callbackAt: new Date(),
            callbackLastError: null,
          },
        });
        return;
      }
      lastError = `HTTP ${res.status} ${res.text.slice(0, 200)}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "request failed";
    }
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      callbackStatus: "FAILED",
      callbackAttempts: { increment: 1 },
      callbackAt: new Date(),
      callbackLastError: lastError.slice(0, 500),
    },
  });
}
