import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Card2pay",
  description: "How Card2pay collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="12 June 2026">
      <section>
        <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
        <p>
          Card2pay (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the Card2pay
          payment platform at card2pay.app and related services. This Privacy Policy
          explains how we collect, use, disclose, and safeguard information when you
          use our website, merchant dashboard, payment links, and checkout flows.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">2. Information we collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-white/90">Account data</strong> — name, email
            address, company name, and authentication credentials when you register as
            a merchant.
          </li>
          <li>
            <strong className="text-white/90">Payment and order data</strong> — order
            references, amounts, currencies, payer email addresses supplied by
            merchants or checkout integrations, transaction status, and settlement
            details.
          </li>
          <li>
            <strong className="text-white/90">Technical data</strong> — IP address,
            browser type, device information, log files, and cookies required for
            security and session management.
          </li>
          <li>
            <strong className="text-white/90">Communications</strong> — messages you
            send to our support team and records of support interactions.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">3. How we use information</h2>
        <p>We use collected information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Provide, operate, and maintain the Card2pay platform;</li>
          <li>Process payments and notify integrated merchant sites of order status;</li>
          <li>Authenticate users and prevent fraud or abuse;</li>
          <li>Comply with legal, regulatory, and accounting obligations;</li>
          <li>Respond to support requests and improve our services.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">4. Sharing of information</h2>
        <p>
          We do not sell personal data. We may share information with payment
          processors, blockchain settlement providers, hosting infrastructure
          partners, and professional advisers where necessary to deliver the service
          or comply with law. Integrated merchant sites receive only the order and
          payment confirmation data required to fulfil their transactions.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">5. Data retention</h2>
        <p>
          We retain account and transaction records for as long as your account is
          active and as required for legal, tax, audit, and dispute-resolution
          purposes. You may request deletion of non-mandatory data by contacting us,
          subject to regulatory retention requirements.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">6. Security</h2>
        <p>
          We implement administrative, technical, and organisational measures
          designed to protect your information, including encrypted transport,
          access controls, and signed webhooks for merchant integrations. No method
          of transmission over the Internet is completely secure; we cannot guarantee
          absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">7. Your rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct,
          delete, or restrict processing of your personal data, and to object to
          certain processing. To exercise these rights, contact us at{" "}
          <a href="mailto:info@card2pay.app" className="text-gold-400 hover:text-gold-300">
            info@card2pay.app
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">8. International transfers</h2>
        <p>
          Your information may be processed in countries other than your country of
          residence. Where required, we implement appropriate safeguards for such
          transfers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will
          be posted on this page with an updated &quot;Last updated&quot; date.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">10. Contact</h2>
        <p>
          Questions about this Privacy Policy may be sent to{" "}
          <a href="mailto:info@card2pay.app" className="text-gold-400 hover:text-gold-300">
            info@card2pay.app
          </a>{" "}
          or via our{" "}
          <a href="/contact" className="text-gold-400 hover:text-gold-300">
            Contact Us
          </a>{" "}
          page.
        </p>
      </section>
    </LegalPageShell>
  );
}
