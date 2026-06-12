import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toNumber } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      link: true,
      site: { select: { name: true } },
      creator: { select: { name: true, email: true } },
    },
  });

  const header = [
    "reference",
    "created_at",
    "merchant_name",
    "merchant_email",
    "link_title",
    "amount",
    "currency",
    "pay_amount",
    "pay_currency",
    "pay_address",
    "now_payment_id",
    "status",
    "paid_at",
    "payout_status",
    "payout_tx_ref",
    "payout_at",
    "payer_email",
  ];

  const rows = orders.map((o) =>
    [
      o.reference,
      o.createdAt.toISOString(),
      o.creator.name,
      o.creator.email,
      o.link?.title ?? o.site?.name ?? o.description ?? "",
      toNumber(o.amount).toFixed(2),
      o.currency,
      o.payAmount ? o.payAmount.toString() : "",
      o.payCurrency ?? "",
      o.payAddress ?? "",
      o.nowPaymentId ?? "",
      o.status,
      o.paidAt ? o.paidAt.toISOString() : "",
      o.payoutStatus,
      o.payoutTxRef ?? "",
      o.payoutAt ? o.payoutAt.toISOString() : "",
      o.payerEmail ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `card2pay-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
