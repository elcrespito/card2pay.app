import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/ui";
import { LinkStatusBadge, LinkTypeBadge } from "@/components/badges";
import { formatMoney, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminLinks() {
  const links = await prisma.paymentLink.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Payment links" subtitle="All links created across the platform." />
      {links.length === 0 ? (
        <div className="card text-sm text-white/50">No links yet.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-white/[0.06]">
              <tr>
                <th className="table-th">Title</th>
                <th className="table-th">Merchant</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Type</th>
                <th className="table-th">Orders</th>
                <th className="table-th">Status</th>
                <th className="table-th">Link</th>
                <th className="table-th">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {links.map((l) => (
                <tr key={l.id}>
                  <td className="table-td text-white">{l.title}</td>
                  <td className="table-td">
                    <span className="block text-white/80">{l.creator.name}</span>
                    <span className="block text-[11px] text-white/40">{l.creator.email}</span>
                  </td>
                  <td className="table-td">{formatMoney(l.amount, l.currency)}</td>
                  <td className="table-td">
                    <LinkTypeBadge type={l.type} />
                  </td>
                  <td className="table-td">{l._count.orders}</td>
                  <td className="table-td">
                    <LinkStatusBadge status={l.status} />
                  </td>
                  <td className="table-td">
                    <a
                      href={`${env.appUrl}/pay/${l.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="font-mono text-[11px] text-gold-400 hover:text-gold-300"
                    >
                      /pay/{l.slug}
                    </a>
                  </td>
                  <td className="table-td whitespace-nowrap text-white/50">
                    {formatDate(l.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
