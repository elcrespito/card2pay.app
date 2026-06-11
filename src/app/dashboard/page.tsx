import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { OrderStatusBadge, PayoutStatusBadge } from "@/components/badges";
import { formatMoney, formatDate, toNumber } from "@/lib/format";

export default async function DashboardOverview() {
  const user = await requireActiveUser();

  const [linkCount, orders, paidAgg, recent] = await Promise.all([
    prisma.paymentLink.count({ where: { creatorId: user.id } }),
    prisma.order.count({ where: { creatorId: user.id } }),
    prisma.order.aggregate({
      where: { creatorId: user.id, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { link: true },
    }),
  ]);

  const owedAgg = await prisma.order.aggregate({
    where: { creatorId: user.id, status: "PAID", payoutStatus: { not: "SENT" } },
    _sum: { amount: true },
  });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Your payment links and settlement activity at a glance."
        action={
          <Link href="/dashboard/links/new" className="btn-primary">
            + New payment link
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Payment links" value={linkCount} />
        <StatCard label="Total orders" value={orders} />
        <StatCard
          label="Collected (paid)"
          value={formatMoney(paidAgg._sum.amount)}
          hint={`${paidAgg._count} paid orders`}
        />
        <StatCard
          label="Awaiting payout"
          value={formatMoney(owedAgg._sum.amount)}
          hint="To be sent to you"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-gold-400 hover:text-gold-300">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Create a payment link and share it to start receiving payments."
            cta={{ href: "/dashboard/links/new", label: "Create your first link" }}
          />
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  <th className="table-th">Order</th>
                  <th className="table-th">Link</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Payout</th>
                  <th className="table-th">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="table-td font-mono text-xs text-white">{o.reference}</td>
                    <td className="table-td">{o.link.title}</td>
                    <td className="table-td">{formatMoney(o.amount, o.currency)}</td>
                    <td className="table-td">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="table-td">
                      {o.status === "PAID" ? (
                        <PayoutStatusBadge status={o.payoutStatus} />
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="table-td text-white/50">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
