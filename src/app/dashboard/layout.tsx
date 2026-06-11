import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/links", label: "Payment links" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/settings", label: "Payout settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");

  return (
    <DashboardShell user={user} nav={NAV} area="Merchant">
      {children}
    </DashboardShell>
  );
}
