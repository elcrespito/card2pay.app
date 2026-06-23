"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSiteAction, type FormState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function CreateSiteForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createSiteAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Site name
          </label>
          <input
            id="name"
            name="name"
            required
            className="input"
            placeholder="My WooCommerce store"
          />
        </div>
        <div>
          <label className="label" htmlFor="domain">
            Domain <span className="text-white/25">(optional)</span>
          </label>
          <input
            id="domain"
            name="domain"
            className="input"
            placeholder="shop.example.com"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="callbackUrl">
          Callback URL <span className="text-white/25">(notified on paid)</span>
        </label>
        <input
          id="callbackUrl"
          name="callbackUrl"
          className="input"
          placeholder="https://shop.example.com/wp-json/card2pay/v1/callback"
        />
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Creating…">Create site &amp; API keys</SubmitButton>
    </form>
  );
}
