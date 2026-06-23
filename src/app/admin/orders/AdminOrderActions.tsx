"use client";

import { useActionState, useState } from "react";
import type { OrderStatus, PayoutStatus } from "@prisma/client";
import { updatePayoutAction, markOrderPaidAction, type AdminState } from "../actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

interface Props {
  id: string;
  status: OrderStatus;
  payoutStatus: PayoutStatus;
  payoutTxRef: string | null;
  payoutNote: string | null;
}

export function AdminOrderActions({
  id,
  status,
  payoutStatus,
  payoutTxRef,
  payoutNote,
}: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<AdminState, FormData>(
    updatePayoutAction,
    undefined
  );

  if (status !== "PAID") {
    return (
      <form action={markOrderPaidAction}>
        <input type="hidden" name="id" value={id} />
        <button className="btn-ghost px-3 py-1.5 text-xs">Mark paid</button>
      </form>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost px-3 py-1.5 text-xs"
      >
        Manage payout
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-white/10 bg-ink-850 p-4 text-left shadow-card">
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="id" value={id} />
            <div>
              <label className="label">Payout status</label>
              <select name="payoutStatus" defaultValue={payoutStatus} className="input">
                <option value="UNPAID">Unpaid</option>
                <option value="PROCESSING">Processing</option>
                <option value="SENT">Sent</option>
              </select>
            </div>
            <div>
              <label className="label">Tx reference</label>
              <input
                name="payoutTxRef"
                defaultValue={payoutTxRef ?? ""}
                className="input"
                placeholder="Tx hash / transfer id"
              />
            </div>
            <div>
              <label className="label">Note</label>
              <input name="payoutNote" defaultValue={payoutNote ?? ""} className="input" />
            </div>
            {state?.ok ? (
              <p className="text-xs text-emerald-300">Saved.</p>
            ) : state?.error ? (
              <p className="text-xs text-red-300">{state.error}</p>
            ) : null}
            <SubmitButton className="btn-primary w-full py-2 text-xs" pendingLabel="Saving…">
              Save payout
            </SubmitButton>
          </form>
        </div>
      ) : null}
    </div>
  );
}
