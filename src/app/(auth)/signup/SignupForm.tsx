"use client";

import { useActionState } from "react";
import { signupAction, type AuthState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function SignupForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    signupAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Full name
        </label>
        <input id="name" name="name" required className="input" placeholder="Jane Doe" />
      </div>
      <div>
        <label className="label" htmlFor="company">
          Company <span className="text-white/25">(optional)</span>
        </label>
        <input id="company" name="company" className="input" placeholder="Acme Ltd." />
      </div>
      <div>
        <label className="label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
          placeholder="At least 8 characters"
        />
      </div>
      {state?.error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
      <p className="text-center text-xs text-white/30">
        Card2pay is not available to U.S. citizens or residents.
      </p>
    </form>
  );
}
