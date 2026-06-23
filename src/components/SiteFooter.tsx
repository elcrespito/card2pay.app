import Link from "next/link";
import { Brand } from "@/components/Brand";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div
        className={
          "mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 " +
          (compact
            ? "text-center"
            : "sm:flex-row sm:items-center sm:justify-between")
        }
      >
        {!compact ? <Brand /> : null}

        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          aria-label="Legal and contact"
        >
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Card2pay. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
