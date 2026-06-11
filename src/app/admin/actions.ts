"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export type AdminState = { error?: string; ok?: boolean } | undefined;

export async function setUserStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!["ACTIVE", "SUSPENDED", "PENDING"].includes(status)) return;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role === "ADMIN") return; // never modify admins here

  await prisma.user.update({
    where: { id },
    data: { status: status as "ACTIVE" | "SUSPENDED" | "PENDING" },
  });
  revalidatePath("/admin/merchants");
  revalidatePath("/admin");
}

export async function markOrderPaidAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return;
  await prisma.order.update({
    where: { id },
    data: { status: "PAID", paidAt: order.paidAt ?? new Date() },
  });
  revalidatePath("/admin/orders");
}

const payoutSchema = z.object({
  id: z.string().min(1),
  payoutStatus: z.enum(["UNPAID", "PROCESSING", "SENT"]),
  payoutTxRef: z.string().max(200).optional(),
  payoutNote: z.string().max(500).optional(),
});

export async function updatePayoutAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = payoutSchema.safeParse({
    id: formData.get("id"),
    payoutStatus: formData.get("payoutStatus"),
    payoutTxRef: formData.get("payoutTxRef") || undefined,
    payoutNote: formData.get("payoutNote") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.order.update({
    where: { id: parsed.data.id },
    data: {
      payoutStatus: parsed.data.payoutStatus,
      payoutTxRef: parsed.data.payoutTxRef,
      payoutNote: parsed.data.payoutNote,
      payoutAt: parsed.data.payoutStatus === "SENT" ? new Date() : null,
    },
  });
  revalidatePath("/admin/orders");
  return { ok: true };
}
