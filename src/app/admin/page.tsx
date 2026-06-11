import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader, StatCard } from "@/components/ui";
import { OrdersTable } from "@/components/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [
    merchants,
    pending,
    totalOrders,
    paidAgg,
    payoutDueAgg,
    recent,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "MERCHANT" } }),
    prisma.user.count({ where: { role: "MERCHANT", status: "PENDING" } }),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    prisma.order.aggregate({
      where: { status: "PAID", payoutStatus: { not: "SENT" } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { link: true, creator: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Control center"
        subtitle="Platform-wide view of merchants, orders, and payouts."
        action={
          <Link href="/admin/orders/export" className="btn-ghost">
            Export orders (CSV)
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Merchants"
          value={merchants}
          hint={pending ? `${pending} awaiting approval` : "All reviewed"}
        />
        <StatCard label="Total orders" value={totalOrders} />
        <StatCard
          label="Collected (paid)"
          value={usd(paidAgg._sum.amount)}
          hint={`${paidAgg._count} paid orders`}
        />
        <StatCard
          label="Payouts due"
          value={usd(payoutDueAgg._sum.amount)}
          hint={`${payoutDueAgg._count} orders to settle`}
        />
      </div>

      {pending > 0 ? (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4">
          <p className="text-sm text-amber-200">
            {pending} merchant{pending === 1 ? "" : "s"} awaiting approval.
          </p>
          <Link href="/admin/merchants?filter=PENDING" className="btn-ghost">
            Review now
          </Link>
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-gold-400 hover:text-gold-300">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="card text-sm text-white/50">No orders yet.</div>
        ) : (
          <OrdersTable orders={recent} showCreator />
        )}
      </div>
    </div>
  );
}

function usd(v: unknown): string {
  const n = v == null ? 0 : Number(v.toString());
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
