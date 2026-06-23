"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";

function prettyCurrency(code: string): string {
  const c = code.toLowerCase();
  if (c.includes("trc20")) return code.replace(/trc20/i, "").toUpperCase() + " · TRC20";
  if (c.includes("erc20")) return code.replace(/erc20/i, "").toUpperCase() + " · ERC20";
  if (c.includes("bep20")) return code.replace(/bep20/i, "").toUpperCase() + " · BEP20";
  return code.toUpperCase();
}

export function CheckoutMethods({
  reference,
  payAddress,
  payAmount,
  payCurrency,
  sandbox,
}: {
  reference: string;
  payAddress: string;
  payAmount: string;
  payCurrency: string;
  sandbox: boolean;
}) {
  const [paying, setPaying] = useState(false);
  const hasAddress = payAddress !== "";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(
    payAddress
  )}`;

  async function simulatePaid() {
    setPaying(true);
    try {
      const res = await fetch("/api/test/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
    } catch {
      /* fall through */
    }
    setPaying(false);
  }

  return (
    <div className="card">
      {hasAddress ? (
        <div>
          <p className="mb-3 text-sm text-white/60">
            Send exactly this amount to the address below. Your order updates
            automatically once the network confirms it, and your store receives a
            webhook notification.
          </p>

          <div className="mb-3 rounded-lg border border-white/10 bg-ink-850 p-3">
            <p className="text-xs uppercase tracking-wide text-white/40">Amount</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 text-sm text-white">
                {payAmount} {prettyCurrency(payCurrency)}
              </code>
              <CopyButton value={payAmount} />
            </div>
          </div>

          <div className="mb-4 rounded-lg border border-white/10 bg-ink-850 p-3">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Deposit address
            </p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 break-all text-sm text-white/80">
                {payAddress}
              </code>
              <CopyButton value={payAddress} />
            </div>
          </div>

          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="Deposit address QR"
              width={180}
              height={180}
              className="rounded-lg bg-white p-2"
            />
          </div>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-white/50">
          Generating your deposit address… refresh in a moment, or use the test
          button below.
        </p>
      )}

      {sandbox ? (
        <div className="mt-4 rounded-lg border border-dashed border-amber-400/40 bg-amber-400/[0.06] p-3">
          <p className="mb-2 text-xs text-amber-200/80">
            Test mode — simulate a confirmed payment without sending crypto.
          </p>
          <button
            type="button"
            onClick={simulatePaid}
            disabled={paying}
            className="w-full rounded-lg bg-emerald-500/20 px-3 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-60"
          >
            {paying ? "Marking as paid…" : "✓ Simulate payment (mark as paid)"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
