"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { generateOrderReference } from "@/lib/ids";
import { createPayment } from "@/lib/nowpayments";
import { toNumber } from "@/lib/format";

export type PayState = { error?: string } | undefined;

const startSchema = z.object({
  slug: z.string().min(4),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
});

export async function startPaymentAction(
  _prev: PayState,
  formData: FormData
): Promise<PayState> {
  const parsed = startSchema.safeParse({
    slug: formData.get("slug"),
    email: String(formData.get("email") || ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { slug } = parsed.data;
  const email = parsed.data.email || undefined;

  const link = await prisma.paymentLink.findUnique({ where: { slug } });
  if (!link || link.status !== "ACTIVE") {
    return { error: "This payment link is not available." };
  }

  // One-time links close after a successful payment.
  if (link.type === "ONE_TIME") {
    const paid = await prisma.order.findFirst({
      where: { linkId: link.id, status: "PAID" },
    });
    if (paid) {
      return { error: "This payment link has already been paid." };
    }
  }

  // Create the order first so we have a stable reference for NOWPayments.
  let reference = generateOrderReference();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.order.findUnique({ where: { reference } });
    if (!exists) break;
    reference = generateOrderReference();
  }

  const order = await prisma.order.create({
    data: {
      reference,
      linkId: link.id,
      creatorId: link.creatorId,
      amount: link.amount,
      currency: link.currency,
      payCurrency: env.nowPayments.payCurrency,
      payerEmail: email,
      status: "PENDING",
    },
  });

  try {
    const payment = await createPayment({
      priceAmount: toNumber(link.amount),
      priceCurrency: env.nowPayments.priceCurrency,
      payCurrency: env.nowPayments.payCurrency,
      orderId: order.reference,
      orderDescription: link.title,
      ipnCallbackUrl: `${env.appUrl}/api/webhooks/nowpayments`,
      isFixedRate: env.nowPayments.isFixedRate,
      isFeePaidByUser: env.nowPayments.feePaidByUser,
    });

    if (!payment.pay_address || !payment.pay_amount) {
      throw new Error("No deposit address returned");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        nowPaymentId: String(payment.payment_id),
        payAddress: payment.pay_address,
        payAmount: payment.pay_amount,
        payCurrency: payment.pay_currency ?? env.nowPayments.payCurrency,
        status: "WAITING",
      },
    });
  } catch (e) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    const msg = e instanceof Error ? e.message : "Could not start payment";
    return { error: `We could not start the payment: ${msg}` };
  }

  redirect(`/pay/o/${order.reference}`);
}
