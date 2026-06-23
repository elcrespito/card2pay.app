import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "₿",
    title: "NOWPayments crypto",
    body: "Each order gets a unique deposit address and QR code. Confirmed on-chain automatically.",
  },
  {
    icon: "🔗",
    title: "WooCommerce & pay-by-link",
    body: "Connect your store or share payment links — every order lands in one dashboard.",
  },
  {
    icon: "📊",
    title: "Unified tracking",
    body: "Every order is tracked by reference ID and attributed to its merchant site.",
  },
  {
    icon: "🛡️",
    title: "Signed webhooks",
    body: "When payment confirms we POST to your store with HMAC-SHA256 — order marked paid.",
  },
  {
    icon: "⚡",
    title: "Instant checkout",
    body: "Customer lands from your plugin → deposit address is generated → they pay → webhook fires.",
  },
  {
    icon: "🤝",
    title: "Managed payouts",
    body: "Funds settle to Card2pay; we reconcile and pay merchants to their configured wallet.",
  },
];

const STEPS = [
  { n: "01", t: "Register", d: "Create your merchant account and connect your WooCommerce site." },
  { n: "02", t: "Customer pays", d: "Plugin redirects to Card2pay — we generate a NOWPayments deposit address." },
  { n: "03", t: "We confirm", d: "IPN marks the order paid and sends a signed webhook to your store." },
  { n: "04", t: "You get paid", d: "We settle your balance to your wallet on a schedule you agree with us." },
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const wallet = typeof sp.wallet === "string" ? sp.wallet : undefined;

  // Backward-compat: external integrations (peptide-shop, WooCommerce plugin)
  // redirect customers to /?amount=&wallet=&email= for the hosted checkout.
  if (wallet) {
    const params = new URLSearchParams();
    for (const key of ["amount", "wallet", "email", "external_user_email"]) {
      const v = sp[key];
      if (typeof v === "string" && v) params.set(key, v);
    }
    params.set("auto", "1");
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Brand />
          </div>
          <div className="card overflow-hidden p-0">
            <iframe
              src={`/widget.html?${params.toString()}`}
              title="Card2pay secure checkout"
              className="h-[680px] w-full border-0"
              allow="clipboard-write; payment"
            />
          </div>
          <p className="mt-5 text-center text-xs text-white/30">
            Card2pay is not available to U.S. citizens or residents.
          </p>
        </div>
        <SiteFooter compact />
      </div>
    );
  }

  const user = await getCurrentUser();
  const dashHref = user ? (user.role === "ADMIN" ? "/admin" : "/dashboard") : "/login";

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(50%_100%_at_50%_0%,rgba(214,158,46,0.12),transparent)]"
      />

      <header className="relative">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#features" className="hover:text-white">Platform</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#faq" className="hover:text-white">Support</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href={dashHref} className="btn-primary">Go to dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-primary">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/80">
              Crypto payment platform
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Accept crypto.
              <br />
              Webhook your store.
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/60">
              Card2pay generates a NOWPayments deposit for every order, tracks
              payment in your dashboard, and notifies your WooCommerce store when
              it&apos;s paid. Register and connect your site.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? dashHref : "/signup"} className="btn-primary px-5 py-3">
                {user ? "Open dashboard" : "Create an account"}
              </Link>
              <a href="#how" className="btn-ghost px-5 py-3">See how it works</a>
            </div>
            <p className="mt-6 text-xs text-white/30">
              Card2pay is not available to U.S. citizens or residents.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/80">
              How checkout works
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/60">
              <p>
                <span className="font-medium text-white">1.</span> Customer clicks
                pay on your WooCommerce store
              </p>
              <p>
                <span className="font-medium text-white">2.</span> Card2pay creates
                a NOWPayments deposit address + QR
              </p>
              <p>
                <span className="font-medium text-white">3.</span> Payment confirms
                → signed webhook → order marked paid
              </p>
            </div>
            <Link
              href={user ? dashHref : "/signup"}
              className="btn-primary mt-6 block w-full py-3 text-center"
            >
              {user ? "Open dashboard" : "Register & start"}
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-6xl px-5 py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/80">
          The platform
        </p>
        <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-white">
          Everything you need to get paid
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-white/55">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="relative mx-auto max-w-6xl px-5 py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/80">
          How it works
        </p>
        <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-white">
          From signup to paid order
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card">
              <span className="text-sm font-semibold text-gold-500">{s.n}</span>
              <h3 className="mt-2 text-base font-semibold text-white">{s.t}</h3>
              <p className="mt-1.5 text-sm text-white/55">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="relative mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white">
          Frequently asked
        </h2>
        <div className="mt-8 space-y-3">
          {[
            {
              q: "Who can use Card2pay?",
              a: "Approved merchants worldwide, except U.S. citizens and residents. New accounts are reviewed before going live.",
            },
            {
              q: "How do my customers pay?",
              a: "They are redirected to Card2pay checkout with a unique crypto deposit address (USDT etc.). Once NOWPayments confirms the payment, your store receives a signed webhook.",
            },
            {
              q: "When do I get paid?",
              a: "We reconcile confirmed payments and pay you out to your configured wallet or bank account.",
            },
            {
              q: "How do I reach support?",
              a: "Email info@card2pay.app and our team will help you.",
            },
          ].map((item) => (
            <details key={item.q} className="card group">
              <summary className="cursor-pointer list-none text-sm font-medium text-white">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-white/55">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
