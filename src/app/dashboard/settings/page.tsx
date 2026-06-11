import { requireActiveUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const user = await requireActiveUser();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Payout settings"
        subtitle="Tell us where to send your money. Payouts are processed manually by our team."
      />
      <div className="card">
        <SettingsForm
          user={{
            name: user.name,
            company: user.company,
            payoutMethod: user.payoutMethod,
            payoutAddress: user.payoutAddress,
            payoutNotes: user.payoutNotes,
            email: user.email,
          }}
        />
      </div>
    </div>
  );
}
