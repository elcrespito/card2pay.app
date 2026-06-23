import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage() {
  await requireAdmin();

  const [sites, logs] = await Promise.all([
    prisma.merchantSite.findMany({
      include: { owner: { select: { name: true, email: true } }, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.callbackLog.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
  ]);

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Connected client sites and the delivery log of paid-notifications (test sink)."
      />

      <div className="card mb-6 overflow-x-auto">
        <h2 className="mb-3 text-sm font-semibold text-white">Client sites</h2>
        {sites.length === 0 ? (
          <p className="text-sm text-white/50">No sites connected yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="py-2">Site</th>
                <th className="py-2">Owner</th>
                <th className="py-2">API key</th>
                <th className="py-2">Callback</th>
                <th className="py-2">Orders</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {sites.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="py-2">{s.name}</td>
                  <td className="py-2">{s.owner.email}</td>
                  <td className="py-2 font-mono text-xs">{s.apiKey}</td>
                  <td className="py-2 max-w-[220px] truncate text-xs">
                    {s.callbackUrl || "—"}
                  </td>
                  <td className="py-2">{s._count.orders}</td>
                  <td className="py-2">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-3 text-sm font-semibold text-white">
          Recent callback deliveries (test sink)
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-white/50">No callbacks received yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="py-2">When</th>
                <th className="py-2">API key</th>
                <th className="py-2">Signature</th>
                <th className="py-2">Body</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-white/5 align-top">
                  <td className="py-2 whitespace-nowrap text-xs">
                    {formatDate(l.createdAt)}
                  </td>
                  <td className="py-2 font-mono text-xs">{l.apiKey || "—"}</td>
                  <td className="py-2">
                    {l.signatureOk ? (
                      <span className="text-emerald-300">valid</span>
                    ) : (
                      <span className="text-red-300">invalid</span>
                    )}
                  </td>
                  <td className="py-2">
                    <code className="block max-w-[420px] overflow-x-auto text-xs text-white/60">
                      {JSON.stringify(l.body)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
