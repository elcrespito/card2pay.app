import { requireAdmin } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/merchants", label: "Merchants" },
  { href: "/admin/links", label: "Payment links" },
  { href: "/admin/orders", label: "Orders & payouts" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <DashboardShell user={user} nav={NAV} area="Admin · CMS">
      {children}
    </DashboardShell>
  );
}
