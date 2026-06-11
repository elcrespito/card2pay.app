import { prisma } from "@/lib/db";
import { verifyIpnSignature, mapPaymentStatus } from "@/lib/nowpayments";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IpnPayload {
  payment_id?: string | number;
  payment_status?: string;
  order_id?: string;
  pay_address?: string;
  pay_amount?: number;
  pay_currency?: string;
  actually_paid?: number;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-nowpayments-sig");

  if (!verifyIpnSignature(raw, signature)) {
    return new Response("invalid signature", { status: 403 });
  }

  let data: IpnPayload;
  try {
    data = JSON.parse(raw) as IpnPayload;
  } catch {
    return new Response("invalid payload", { status: 400 });
  }

  // Resolve the order: primary by our order_id (the order reference),
  // fallback by the stored NOWPayments payment_id.
  const order =
    (data.order_id
      ? await prisma.order.findUnique({ where: { reference: data.order_id } })
      : null) ??
    (data.payment_id
      ? await prisma.order.findUnique({
          where: { nowPaymentId: String(data.payment_id) },
        })
      : null);

  if (!order) {
    return new Response("order not found", { status: 404 });
  }

  const status = mapPaymentStatus(data.payment_status ?? "");
  const updates: Prisma.OrderUpdateInput = {
    status,
    lastIpn: data as unknown as Prisma.InputJsonValue,
  };
  if (data.actually_paid != null) updates.actuallyPaid = data.actually_paid;
  if (status === "PAID" && !order.paidAt) updates.paidAt = new Date();

  await prisma.order.update({ where: { id: order.id }, data: updates });

  // Close one-time links once paid so they can't be reused.
  if (status === "PAID") {
    const link = await prisma.paymentLink.findUnique({
      where: { id: order.linkId },
    });
    if (link && link.type === "ONE_TIME" && link.status === "ACTIVE") {
      await prisma.paymentLink.update({
        where: { id: link.id },
        data: { status: "DISABLED" },
      });
    }
  }

  return new Response("ok", { status: 200 });
}
