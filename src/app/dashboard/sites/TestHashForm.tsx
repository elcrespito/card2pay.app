"use client";

import { useActionState } from "react";
import { generateTestHashAction, type HashState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { CopyButton } from "@/components/CopyButton";

export function TestHashForm({ siteId }: { siteId: string }) {
  const [state, formAction] = useActionState<HashState, FormData>(
    generateTestHashAction,
    undefined
  );

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-ink-850 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">
        Generate a test checkout link
      </p>
      <form action={formAction} className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="siteId" value={siteId} />
        <div>
          <label className="label" htmlFor={`oid-${siteId}`}>
            Order id
          </label>
          <input
            id={`oid-${siteId}`}
            name="order_id"
            required
            className="input w-40"
            placeholder="WC-1001"
          />
        </div>
        <div>
          <label className="label" htmlFor={`amt-${siteId}`}>
            Amount
          </label>
          <input
            id={`amt-${siteId}`}
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="input w-28"
            placeholder="25.00"
          />
        </div>
        <div>
          <label className="label" htmlFor={`cur-${siteId}`}>
            Currency
          </label>
          <select
            id={`cur-${siteId}`}
            name="currency"
            className="input w-24"
            defaultValue="USD"
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor={`em-${siteId}`}>
            Email <span className="text-white/25">(optional)</span>
          </label>
          <input
            id={`em-${siteId}`}
            name="email"
            type="email"
            className="input w-52"
            placeholder="buyer@example.com"
          />
        </div>
        <SubmitButton pendingLabel="Building…">Build link</SubmitButton>
      </form>

      {state?.error ? (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      {state?.url ? (
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg bg-black/30 px-3 py-2 text-xs text-white/70">
            {state.url}
          </code>
          <CopyButton value={state.url} />
          <a
            href={state.url}
            target="_blank"
            rel="noreferrer"
            className="btn-primary whitespace-nowrap"
          >
            Open
          </a>
        </div>
      ) : null}
    </div>
  );
}
