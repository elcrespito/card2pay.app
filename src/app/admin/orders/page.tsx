import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { OrdersTable } from "@/components/OrdersTable";
import { AdminOrderActions } from "./AdminOrderActions";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; where: Prisma.OrderWhereInput }[] = [
  { key: "ALL", label: "All", where: {} },
  { key: "PAID", label: "Paid", where: { status: "PAID" } },
  {
    key: "PAYOUT_DUE",
    label: "Awaiting payout",
    where: { status: "PAID", payoutStatus: { not: "SENT" } },
  },
  { key: "WAITING", label: "Waiting", where: { status: { in: ["PENDING", "WAITING", "CONFIRMING"] } } },
];

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  const orders = await prisma.order.findMany({
    where: active.where,
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      link: true,
      site: { select: { name: true } },
      creator: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Orders & payouts"
        subtitle="Track every payment, confirm settlements, and record manual payouts."
        action={
          <Link href="/admin/orders/export" className="btn-ghost">
            Export CSV
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <a
            key={f.key}
            href={f.key === "ALL" ? "/admin/orders" : `/admin/orders?filter=${f.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              f.key === active.key
                ? "bg-gold-500/10 text-gold-300"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card text-sm text-white/50">No orders in this view.</div>
      ) : (
        <OrdersTable
          orders={orders}
          showCreator
          action={(o) => (
            <AdminOrderActions
              id={o.id}
              status={o.status}
              payoutStatus={o.payoutStatus}
              payoutTxRef={o.payoutTxRef}
              payoutNote={o.payoutNote}
            />
          )}
        />
      )}
    </div>
  );
}
