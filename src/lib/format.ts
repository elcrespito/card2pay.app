import type { Prisma } from "@prisma/client";

type DecimalLike = Prisma.Decimal | number | string | null | undefined;

export function toNumber(value: DecimalLike): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export function formatMoney(value: DecimalLike, currency = "USD"): string {
  const n = toNumber(value);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function formatCrypto(value: DecimalLike, currency = ""): string {
  const n = toNumber(value);
  const s = n.toLocaleString("en-US", { maximumFractionDigits: 8 });
  return currency ? `${s} ${currency.toUpperCase()}` : s;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function truncateMiddle(value: string, head = 8, tail = 6): string {
  if (!value) return "";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
