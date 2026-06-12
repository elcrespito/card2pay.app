import "server-only";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { generateOrderReference } from "@/lib/ids";
import { createPayment } from "@/lib/nowpayments";
import type { MerchantSite, Order } from "@prisma/client";
import type { OrderPayload } from "@/lib/gateway";

async function uniqueReference(): Promise<string> {
  let reference = generateOrderReference();
  for (let i = 0; i < 6; i++) {
    const exists = await prisma.order.findUnique({ where: { reference } });
    if (!exists) return reference;
    reference = generateOrderReference();
  }
  return reference;
}

/** Issue (or re-issue) a NOWPayments deposit for an order that has none yet. */
async function ensurePayment(order: Order, description: string): Promise<Order> {
  if (order.payAddress && order.nowPaymentId && order.status !== "FAILED") {
    return order;
  }
  try {
    const payment = await createPayment({
      priceAmount: Number(order.amount),
      priceCurrency: order.currency.toLowerCase(),
      payCurrency: order.payCurrency || env.nowPayments.payCurrency,
      orderId: order.reference,
      orderDescription: description,
      ipnCallbackUrl: `${env.appUrl}/api/webhooks/nowpayments`,
      isFixedRate: env.nowPayments.isFixedRate,
      isFeePaidByUser: env.nowPayments.feePaidByUser,
    });
    if (!payment.pay_address || !payment.pay_amount) {
      throw new Error("No deposit address returned");
    }
    return prisma.order.update({
      where: { id: order.id },
      data: {
        nowPaymentId: String(payment.payment_id),
        payAddress: payment.pay_address,
        payAmount: payment.pay_amount,
        payCurrency: payment.pay_currency || order.payCurrency || env.nowPayments.payCurrency,
        status: "WAITING",
      },
    });
  } catch (e) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    throw e;
  }
}

/**
 * Create (or idempotently reuse) the order for an inbound gateway hash, then
 * make sure it has a live NOWPayments deposit. Returns the order reference so
 * the caller can redirect the customer to the hosted checkout.
 */
export async function startSiteOrder(
  site: MerchantSite,
  payload: OrderPayload
): Promise<Order> {
  const existing = await prisma.order.findUnique({
    where: {
      siteId_externalOrderId: {
        siteId: site.id,
        externalOrderId: payload.order_id,
      },
    },
  });

  const description = payload.description || `Order ${payload.order_id}`;
  const callbackUrl = payload.callback_url || site.callbackUrl || null;

  if (existing) {
    // Already paid — nothing to do, send them to the (paid) checkout view.
    if (existing.status === "PAID") return existing;
    // Refresh mutable fields the site may have changed, then ensure a deposit.
    const refreshed = await prisma.order.update({
      where: { id: existing.id },
      data: {
        returnUrl: payload.return_url ?? existing.returnUrl,
        callbackUrl,
        payerEmail: payload.email ?? existing.payerEmail,
      },
    });
    return ensurePayment(refreshed, description);
  }

  const reference = await uniqueReference();
  const order = await prisma.order.create({
    data: {
      reference,
      siteId: site.id,
      creatorId: site.ownerId,
      externalOrderId: payload.order_id,
      description,
      amount: payload.amount,
      currency: payload.currency.toUpperCase(),
      payCurrency: payload.pay_currency || env.nowPayments.payCurrency,
      payerEmail: payload.email,
      returnUrl: payload.return_url,
      callbackUrl,
      status: "PENDING",
    },
  });

  return ensurePayment(order, description);
}
