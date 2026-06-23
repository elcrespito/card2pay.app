import Link from "next/link";
import { requireActiveUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { PageHeader, EmptyState } from "@/components/ui";
import { LinkStatusBadge, LinkTypeBadge } from "@/components/badges";
import { CopyButton } from "@/components/CopyButton";
import { formatMoney, formatDate } from "@/lib/format";
import { toggleLinkAction } from "../actions";

export default async function LinksPage() {
  const user = await requireActiveUser();

  const links = await prisma.paymentLink.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Payment links"
        subtitle="Create a link, share it with your customer, and we settle the payment."
        action={
          <Link href="/dashboard/links/new" className="btn-primary">
            + New payment link
          </Link>
        }
      />

      {links.length === 0 ? (
        <EmptyState
          title="No payment links yet"
          description="Each link can be paid by card and settled to us; you get paid out afterwards."
          cta={{ href: "/dashboard/links/new", label: "Create your first link" }}
        />
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const url = `${env.appUrl}/pay/${link.slug}`;
            return (
              <div key={link.id} className="card flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-white">{link.title}</p>
                    <LinkTypeBadge type={link.type} />
                    <LinkStatusBadge status={link.status} />
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-white/40">{url}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {link._count.orders} orders · created {formatDate(link.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">
                    {formatMoney(link.amount, link.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton value={url} label="Copy link" />
                  <a href={url} target="_blank" rel="noopener" className="btn-ghost">
                    Open
                  </a>
                  <form action={toggleLinkAction}>
                    <input type="hidden" name="id" value={link.id} />
                    <button type="submit" className="btn-ghost">
                      {link.status === "ACTIVE" ? "Disable" : "Enable"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
