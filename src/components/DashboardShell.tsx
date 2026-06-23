import Link from "next/link";
import type { User } from "@prisma/client";
import { Brand } from "@/components/Brand";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLink } from "@/components/NavLink";

export interface NavItem {
  href: string;
  label: string;
}

export function DashboardShell({
  user,
  nav,
  area,
  children,
}: {
  user: User;
  nav: NavItem[];
  area: string;
  children: React.ReactNode;
}) {
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900 px-4 py-6 md:flex">
        <div className="px-2">
          <Brand href={user.role === "ADMIN" ? "/admin" : "/dashboard"} />
          <p className="mt-1 px-0.5 text-[11px] font-medium uppercase tracking-widest text-gold-500/70">
            {area}
          </p>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-3 px-2 pb-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/[0.06] bg-ink-900/60 px-5 py-3 md:hidden">
          <Brand href={user.role === "ADMIN" ? "/admin" : "/dashboard"} />
          <Link href="/dashboard/settings" className="text-sm text-white/60">
            {user.name}
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
