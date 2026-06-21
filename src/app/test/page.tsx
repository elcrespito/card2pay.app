import { notFound } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { env } from "@/lib/env";
import { SandboxDemoRunner } from "./SandboxDemoRunner";

export const dynamic = "force-dynamic";

export default function SandboxTestPage() {
  if (!env.sandbox) notFound();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(214,158,46,0.12),transparent)]"
      />

      <header className="relative">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-5">
          <Brand />
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            Home
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-lg flex-1 px-5 pb-12 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/80">
          Sandbox
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Integration test bench
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          One button runs the full flow a real store uses: encrypted hash → order
          on dev.card2pay → simulated payment → signed{" "}
          <code className="text-white/70">order.paid</code> callback to our test
          sink. No real money, no WordPress required.
        </p>

        <div className="mt-8">
          <SandboxDemoRunner />
        </div>

        <p className="mt-8 text-xs text-white/30">
          Also available: manual checkout links from{" "}
          <Link href="/dashboard/sites" className="text-white/50 hover:text-white">
            Dashboard → Sites
          </Link>
          . Callback log:{" "}
          <Link href="/admin/integrations" className="text-white/50 hover:text-white">
            Admin → Integrations
          </Link>
          .
        </p>
      </main>

      <SiteFooter compact />
    </div>
  );
}
