"use client";

import { useActionState } from "react";
import { createLinkAction, type FormState } from "../../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function NewLinkForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createLinkAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="label" htmlFor="title">
          Title / description shown to the payer
        </label>
        <input
          id="title"
          name="title"
          required
          className="input"
          placeholder="e.g. Consulting invoice #1024"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Internal note <span className="text-white/25">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="input"
          placeholder="Only visible to you and admins."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="label" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="input"
            placeholder="100.00"
          />
        </div>
        <div>
          <label className="label" htmlFor="currency">
            Currency
          </label>
          <select id="currency" name="currency" className="input" defaultValue="USD">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Link type</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-ink-850 p-3 has-[:checked]:border-gold-500/60 has-[:checked]:bg-gold-500/5">
            <input
              type="radio"
              name="type"
              value="ONE_TIME"
              defaultChecked
              className="mt-1 accent-gold-500"
            />
            <span>
              <span className="block text-sm font-medium text-white">One-time</span>
              <span className="block text-xs text-white/40">
                Can be paid successfully once, then closes.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-ink-850 p-3 has-[:checked]:border-gold-500/60 has-[:checked]:bg-gold-500/5">
            <input
              type="radio"
              name="type"
              value="REUSABLE"
              className="mt-1 accent-gold-500"
            />
            <span>
              <span className="block text-sm font-medium text-white">Reusable</span>
              <span className="block text-xs text-white/40">
                Can be paid many times (recurring / standing).
              </span>
            </span>
          </label>
        </div>
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingLabel="Creating…">Create payment link</SubmitButton>
    </form>
  );
}
