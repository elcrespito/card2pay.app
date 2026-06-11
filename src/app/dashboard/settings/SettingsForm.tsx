"use client";

import { useActionState } from "react";
import { updatePayoutSettingsAction, type FormState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

interface Props {
  user: {
    name: string;
    company: string | null;
    payoutMethod: string | null;
    payoutAddress: string | null;
    payoutNotes: string | null;
    email: string;
  };
}

export function SettingsForm({ user }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updatePayoutSettingsAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input id="name" name="name" required defaultValue={user.name} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input
            id="company"
            name="company"
            defaultValue={user.company ?? ""}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label">Account email</label>
        <input value={user.email} disabled className="input opacity-60" />
      </div>

      <div className="border-t border-white/[0.06] pt-5">
        <h3 className="text-sm font-semibold text-white">Where to pay you</h3>
        <p className="mt-1 text-xs text-white/40">
          We collect payments centrally and send you your share manually.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="payoutMethod">
            Payout method
          </label>
          <select
            id="payoutMethod"
            name="payoutMethod"
            className="input"
            defaultValue={user.payoutMethod ?? "USDT TRC20"}
          >
            <option>USDT TRC20</option>
            <option>USDT ERC20</option>
            <option>Bitcoin</option>
            <option>Bank transfer (SEPA)</option>
            <option>Bank transfer (SWIFT)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="payoutAddress">
            Wallet / IBAN
          </label>
          <input
            id="payoutAddress"
            name="payoutAddress"
            defaultValue={user.payoutAddress ?? ""}
            className="input"
            placeholder="Address or account number"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="payoutNotes">
          Notes for our payout team <span className="text-white/25">(optional)</span>
        </label>
        <textarea
          id="payoutNotes"
          name="payoutNotes"
          rows={2}
          defaultValue={user.payoutNotes ?? ""}
          className="input"
        />
      </div>

      {state?.ok ? (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Settings saved.
        </p>
      ) : null}
      {state?.error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="btn-primary" pendingLabel="Saving…">
        Save settings
      </SubmitButton>
    </form>
  );
}
