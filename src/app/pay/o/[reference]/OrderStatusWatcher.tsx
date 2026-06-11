"use client";

import { useEffect, useState } from "react";
import type { OrderStatus } from "@prisma/client";

const LABELS: Partial<Record<OrderStatus, { text: string; tone: string }>> = {
  WAITING: { text: "Waiting for your payment…", tone: "text-amber-300" },
  CONFIRMING: { text: "Payment detected — confirming on-chain…", tone: "text-sky-300" },
  PARTIALLY_PAID: { text: "Partial payment received.", tone: "text-orange-300" },
  PAID: { text: "Payment confirmed. Thank you!", tone: "text-emerald-300" },
  FAILED: { text: "Payment failed. Please try again.", tone: "text-red-300" },
  EXPIRED: { text: "This payment expired.", tone: "text-zinc-300" },
};

export function OrderStatusWatcher({
  reference,
  initialStatus,
}: {
  reference: string;
  initialStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    if (status === "PAID" || status === "FAILED" || status === "EXPIRED") return;
    let active = true;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${reference}/status`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { status: OrderStatus };
        if (active && data.status && data.status !== status) {
          setStatus(data.status);
          if (data.status === "PAID") {
            // Reload to show the confirmed/closed state.
            setTimeout(() => window.location.reload(), 1200);
          }
        }
      } catch {
        /* keep polling */
      }
    }, 6000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [reference, status]);

  if (status === "PAID") {
    return (
      <div className="card mb-4 flex items-center gap-3 border-emerald-500/20 bg-emerald-500/[0.06]">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
          ✓
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-300">Payment confirmed</p>
          <p className="text-xs text-white/50">Thank you — your payment is complete.</p>
        </div>
      </div>
    );
  }

  const label = LABELS[status];
  if (!label) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5">
      <span className="h-2 w-2 animate-pulse rounded-full bg-current opacity-70" />
      <p className={`text-sm ${label.tone}`}>{label.text}</p>
    </div>
  );
}
