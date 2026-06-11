import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { UserStatusBadge } from "@/components/badges";
import { formatDate } from "@/lib/format";
import { setUserStatusAction } from "../actions";
import type { UserStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACTIVE", label: "Active" },
  { key: "SUSPENDED", label: "Suspended" },
];

export default async function AdminMerchants({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const f = filter && ["PENDING", "ACTIVE", "SUSPENDED"].includes(filter)
    ? (filter as UserStatus)
    : undefined;

  const merchants = await prisma.user.findMany({
    where: { role: "MERCHANT", ...(f ? { status: f } : {}) },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { links: true, orders: true } } },
  });

  return (
    <div>
      <PageHeader title="Merchants" subtitle="Approve new sign-ups and manage access." />

      <div className="mb-4 flex gap-2">
        {FILTERS.map((opt) => (
          <a
            key={opt.key}
            href={opt.key === "ALL" ? "/admin/merchants" : `/admin/merchants?filter=${opt.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              (opt.key === "ALL" && !f) || opt.key === f
                ? "bg-gold-500/10 text-gold-300"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      {merchants.length === 0 ? (
        <div className="card text-sm text-white/50">No merchants in this view.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-white/[0.06]">
              <tr>
                <th className="table-th">Merchant</th>
                <th className="table-th">Payout</th>
                <th className="table-th">Links</th>
                <th className="table-th">Orders</th>
                <th className="table-th">Status</th>
                <th className="table-th">Joined</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {merchants.map((m) => (
                <tr key={m.id}>
                  <td className="table-td">
                    <span className="block font-medium text-white">{m.name}</span>
                    <span className="block text-[11px] text-white/40">{m.email}</span>
                    {m.company ? (
                      <span className="block text-[11px] text-white/40">{m.company}</span>
                    ) : null}
                  </td>
                  <td className="table-td">
                    {m.payoutMethod ? (
                      <span className="text-white/70">
                        {m.payoutMethod}
                        {m.payoutAddress ? (
                          <span className="block font-mono text-[11px] text-white/35">
                            {m.payoutAddress}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-white/30">Not set</span>
                    )}
                  </td>
                  <td className="table-td">{m._count.links}</td>
                  <td className="table-td">{m._count.orders}</td>
                  <td className="table-td">
                    <UserStatusBadge status={m.status} />
                  </td>
                  <td className="table-td whitespace-nowrap text-white/50">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="table-td">
                    <div className="flex justify-end gap-2">
                      {m.status !== "ACTIVE" ? (
                        <form action={setUserStatusAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="status" value="ACTIVE" />
                          <button className="btn-primary px-3 py-1.5 text-xs">Approve</button>
                        </form>
                      ) : null}
                      {m.status !== "SUSPENDED" ? (
                        <form action={setUserStatusAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="status" value="SUSPENDED" />
                          <button className="btn-danger px-3 py-1.5 text-xs">Suspend</button>
                        </form>
                      ) : (
                        <form action={setUserStatusAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="status" value="ACTIVE" />
                          <button className="btn-ghost px-3 py-1.5 text-xs">Reinstate</button>
                        </form>
                      )}
                    </div>
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
