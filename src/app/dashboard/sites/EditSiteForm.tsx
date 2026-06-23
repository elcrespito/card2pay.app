"use client";

import { useActionState } from "react";
import { updateSiteAction, type FormState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function EditSiteForm({
  id,
  name,
  domain,
  callbackUrl,
}: {
  id: string;
  name: string;
  domain: string | null;
  callbackUrl: string | null;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateSiteAction,
    undefined
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className="label">Name</label>
        <input name="name" defaultValue={name} required className="input" />
      </div>
      <div>
        <label className="label">Callback URL</label>
        <input
          name="callbackUrl"
          defaultValue={callbackUrl ?? ""}
          className="input"
          placeholder="https://…/wp-json/card2pay/v1/callback"
        />
      </div>
      <input type="hidden" name="domain" defaultValue={domain ?? ""} />
      <div className="flex items-center gap-2">
        <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
        {state?.ok ? <span className="text-xs text-emerald-300">Saved</span> : null}
        {state?.error ? (
          <span className="text-xs text-red-300">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
