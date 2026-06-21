"use client";

import { useState } from "react";

interface E2EResult {
  ok: boolean;
  steps: {
    hashGenerated: boolean;
    orderCreated: boolean;
    paymentSimulated: boolean;
    callbackReceived: boolean;
    callbackSignatureValid: boolean;
  };
  externalOrderId: string;
  reference: string;
  amount: number;
  currency: string;
  hashUrl: string;
  checkoutUrl: string;
  callbackBody?: unknown;
  callbackStatus?: string;
  error?: string;
}

const STEP_LABELS = [
  ["hashGenerated", "Generate encrypted hash URL"],
  ["orderCreated", "Create order on Card2pay"],
  ["paymentSimulated", "Simulate payment (test mode)"],
  ["callbackReceived", "Deliver signed callback to test sink"],
  ["callbackSignatureValid", "Verify callback HMAC signature"],
] as const;

export function SandboxDemoRunner() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<E2EResult | null>(null);

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/test/run-e2e", { method: "POST" });
      const data = (await res.json()) as E2EResult;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        steps: {
          hashGenerated: false,
          orderCreated: false,
          paymentSimulated: false,
          callbackReceived: false,
          callbackSignatureValid: false,
        },
        externalOrderId: "",
        reference: "",
        amount: 0,
        currency: "USD",
        hashUrl: "",
        checkoutUrl: "",
        error: "Network error — could not reach the test API.",
      });
    }
    setRunning(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="btn-primary w-full px-5 py-3 text-base disabled:opacity-60"
      >
        {running ? "Running full test…" : "▶ Run full integration test"}
      </button>

      {result ? (
        <div className="mt-8 space-y-6">
          <div
            className={
              "card border " +
              (result.ok
                ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                : "border-red-500/30 bg-red-500/[0.06]")
            }
          >
            <p
              className={
                "text-lg font-semibold " +
                (result.ok ? "text-emerald-300" : "text-red-300")
              }
            >
              {result.ok
                ? "✓ All steps passed — integration works end-to-end"
                : "✗ Test did not complete successfully"}
            </p>
            {result.error ? (
              <p className="mt-2 text-sm text-white/60">{result.error}</p>
            ) : null}
          </div>

          <div className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-white/40">
              Steps
            </p>
            <ul className="mt-3 space-y-2">
              {STEP_LABELS.map(([key, label]) => {
                const ok = result.steps[key];
                return (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <span className={ok ? "text-emerald-400" : "text-red-400"}>
                      {ok ? "✓" : "✗"}
                    </span>
                    <span className={ok ? "text-white/80" : "text-white/50"}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {result.reference ? (
            <div className="card space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                Generated URLs
              </p>
              <div>
                <p className="text-xs text-white/40">Hash intake (as a real store would use)</p>
                <code className="mt-1 block break-all text-xs text-white/70">
                  {result.hashUrl}
                </code>
              </div>
              <div>
                <p className="text-xs text-white/40">Hosted checkout</p>
                <a
                  href={result.checkoutUrl}
                  className="mt-1 block break-all text-xs text-gold-400 hover:text-gold-300"
                  target="_blank"
                  rel="noreferrer"
                >
                  {result.checkoutUrl}
                </a>
              </div>
              <p className="text-xs text-white/40">
                Order {result.externalOrderId} → reference{" "}
                <span className="font-mono text-white/60">{result.reference}</span>{" "}
                ({result.currency} {result.amount})
              </p>
            </div>
          ) : null}

          {result.callbackBody ? (
            <div className="card">
              <p className="text-xs font-medium uppercase tracking-wide text-white/40">
                Callback payload received by test sink
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">
                {JSON.stringify(result.callbackBody, null, 2)}
              </pre>
              {result.callbackStatus ? (
                <p className="mt-2 text-xs text-white/40">
                  Delivery status: {result.callbackStatus}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
