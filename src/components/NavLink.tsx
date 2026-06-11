"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-gold-500/10 text-gold-300"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
