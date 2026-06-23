import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";

export function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(214,158,46,0.1),transparent)]"
      />

      <header className="relative">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
          <Brand />
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            Home
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/80">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-white/40">Last updated: {updated}</p>

        <article className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-white/70">
          {children}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
