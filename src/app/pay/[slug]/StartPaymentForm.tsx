"use client";

import { useActionState } from "react";
import { startPaymentAction, type PayState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function StartPaymentForm({ slug }: { slug: string }) {
  const [state, formAction] = useActionState<PayState, FormData>(
    startPaymentAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <div>
        <label className="label" htmlFor="email">
          Your email <span className="text-white/25">(for the receipt)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          placeholder="you@email.com"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-white/50">
        <input type="checkbox" required className="mt-0.5 accent-gold-500" />
        <span>
          I confirm I am not a U.S. citizen or resident and I am allowed to use
          this service in my jurisdiction.
        </span>
      </label>

      {state?.error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="btn-primary w-full" pendingLabel="Preparing secure checkout…">
        Pay by card
      </SubmitButton>
    </form>
  );
}
