import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Contact Us — Card2pay",
  description: "Get in touch with the Card2pay team for support, partnerships, and compliance enquiries.",
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Contact Us" updated="12 June 2026">
      <section>
        <p>
          Our team supports merchants, integration partners, and payment enquiries.
          We aim to respond to all messages within one business day.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="text-base font-semibold text-white">General &amp; support</h2>
          <p className="mt-2">
            Account questions, payment links, checkout issues, and technical support.
          </p>
          <a
            href="mailto:info@card2pay.app"
            className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            info@card2pay.app
          </a>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-white">Integrations</h2>
          <p className="mt-2">
            WooCommerce plugins, API credentials, webhooks, and merchant site setup.
          </p>
          <a
            href="mailto:info@card2pay.app?subject=Integration%20enquiry"
            className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            info@card2pay.app
          </a>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-white">Compliance &amp; privacy</h2>
          <p className="mt-2">
            Data requests, privacy matters, and legal correspondence.
          </p>
          <a
            href="mailto:info@card2pay.app?subject=Compliance%20enquiry"
            className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            info@card2pay.app
          </a>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-white">Platform</h2>
          <p className="mt-2">
            Card2pay — enterprise payment links &amp; card-to-crypto checkout.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-gold-400 hover:text-gold-300"
          >
            card2pay.app
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Before you write</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            For payment status on a specific order, include your order reference
            (e.g. <code className="text-white/80">C2P-XXXXXX</code>).
          </li>
          <li>
            For integration issues, include your site name and the approximate time
            of the failed callback.
          </li>
          <li>
            Card2pay is not available to U.S. citizens or residents.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Related policies</h2>
        <p className="mt-2">
          See our{" "}
          <Link href="/privacy" className="text-gold-400 hover:text-gold-300">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-gold-400 hover:text-gold-300">
            Terms of Service
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
