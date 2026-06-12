import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { CreateSiteForm } from "./CreateSiteForm";
import { EditSiteForm } from "./EditSiteForm";
import { TestHashForm } from "./TestHashForm";
import { rotateSiteSecretAction, toggleSiteAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
  const user = await requireUser();
  const sites = await prisma.merchantSite.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Sites (API)"
        subtitle="Integrate a store (e.g. WooCommerce) — it sends signed orders to Card2pay and we notify it back when paid."
      />

      <div className="card mb-6">
        <h2 className="mb-3 text-sm font-semibold text-white">Add a site</h2>
        <CreateSiteForm />
      </div>

      {sites.length === 0 ? (
        <p className="text-sm text-white/50">No sites yet. Create one above.</p>
      ) : (
        <div className="space-y-5">
          {sites.map((s) => (
            <div key={s.id} className="card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-white">{s.name}</p>
                  <p className="text-xs text-white/40">{s.domain || "—"}</p>
                </div>
                <span
                  className={
                    s.status === "ACTIVE"
                      ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                      : "rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/50"
                  }
                >
                  {s.status}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CredRow label="API key" value={s.apiKey} />
                <CredRow label="API secret" value={s.apiSecret} secret />
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-ink-850 p-3 text-xs text-white/50">
                Checkout endpoint:{" "}
                <code className="text-white/70">{env.appUrl}/pay/h/&lt;hash&gt;</code>
                <br />
                Build the hash with AES-256-GCM (key = SHA-256 of the API secret,
                AAD = API key). The WordPress plugin does this for you.
              </div>

              <div className="mt-4">
                <EditSiteForm
                  id={s.id}
                  name={s.name}
                  domain={s.domain}
                  callbackUrl={s.callbackUrl}
                />
              </div>

              <TestHashForm siteId={s.id} />

              <div className="mt-4 flex gap-2">
                <form action={toggleSiteAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn-ghost">
                    {s.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                </form>
                <form action={rotateSiteSecretAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="btn-ghost">
                    Rotate secret
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CredRow({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const shown = secret ? value.slice(0, 6) + "••••••••" + value.slice(-4) : value;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-850 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 overflow-x-auto text-xs text-white/70">{shown}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}
