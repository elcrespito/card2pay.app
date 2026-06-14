import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service — Card2pay",
  description: "Terms governing use of the Card2pay payment platform.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageShell title="Terms of Service" updated="12 June 2026">
      <section>
        <h2 className="text-lg font-semibold text-white">1. Agreement</h2>
        <p>
          By accessing or using Card2pay (&quot;the Platform&quot;), you agree to
          these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use
          the Platform. These Terms apply to merchants, administrators, and anyone
          who creates payment links or completes checkout through Card2pay.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">2. Eligibility</h2>
        <p>
          The Platform is not available to U.S. citizens or residents. You must be at
          least 18 years old and legally able to enter into binding contracts in your
          jurisdiction. Merchant accounts may require admin approval before creating
          payment links or receiving payouts.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">3. The service</h2>
        <p>
          Card2pay provides payment-link creation, hosted checkout, card-to-crypto
          processing, order tracking, and merchant integrations. We act as a
          technology and payment orchestration platform. Settlement, reconciliation,
          and payout schedules are described in your merchant agreement or dashboard.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">4. Merchant responsibilities</h2>
        <p>As a merchant you agree to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Provide accurate account and payout information;</li>
          <li>Use the Platform only for lawful goods and services;</li>
          <li>Honour orders once payment is confirmed via Card2pay;</li>
          <li>Keep API credentials confidential and notify us of suspected compromise;</li>
          <li>Comply with applicable tax, consumer-protection, and anti-money-laundering laws.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">5. Customer checkout</h2>
        <p>
          End customers who pay through Card2pay links or integrated checkouts
          authorise payment for the amount and merchant shown at checkout. Card2pay
          is not a party to the underlying sale between merchant and customer except
          as a payment facilitator.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">6. Fees and settlement</h2>
        <p>
          Processing fees, exchange rates, and payout terms are disclosed at account
          setup or in your dashboard. We may withhold or delay settlement where
          required by law, suspected fraud, chargeback risk, or account review.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">7. Prohibited use</h2>
        <p>You may not use Card2pay for illegal activity, sanctions evasion, fraud,
          money laundering, unauthorised resale of access, or any activity that
          violates our policies or the policies of our payment partners.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">8. Intellectual property</h2>
        <p>
          Card2pay branding, software, and documentation are owned by us or our
          licensors. You receive a limited, non-exclusive licence to use the Platform
          for its intended purpose while your account remains in good standing.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">9. Disclaimer</h2>
        <p>
          The Platform is provided &quot;as is&quot; and &quot;as available&quot; to
          the extent permitted by law. We do not warrant uninterrupted or error-free
          operation. Cryptocurrency values and network confirmations are subject to
          third-party networks outside our control.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">10. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Card2pay and its affiliates shall
          not be liable for indirect, incidental, special, or consequential damages,
          or for loss of profits, data, or goodwill. Our aggregate liability arising
          from these Terms shall not exceed the fees paid by you to us in the twelve
          months preceding the claim.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">11. Suspension and termination</h2>
        <p>
          We may suspend or terminate access for violation of these Terms, legal
          requirements, or risk to the Platform. You may close your account by
          contacting support. Provisions that by nature should survive termination
          will remain in effect.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">12. Governing law</h2>
        <p>
          These Terms are governed by the laws applicable to Card2pay&apos;s operating
          entity, without regard to conflict-of-law principles. Disputes shall be
          resolved in the courts or arbitration forum specified in your merchant
          agreement, if any.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">13. Contact</h2>
        <p>
          For questions about these Terms, contact{" "}
          <a href="mailto:info@card2pay.app" className="text-gold-400 hover:text-gold-300">
            info@card2pay.app
          </a>{" "}
          or visit{" "}
          <a href="/contact" className="text-gold-400 hover:text-gold-300">
            Contact Us
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
