import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";

const API_BASE = "https://api.nowpayments.io/v1";

export interface CreatePaymentArgs {
  priceAmount: number;
  priceCurrency: string; // e.g. "usd"
  payCurrency: string; // e.g. "usdttrc20"
  orderId: string;
  orderDescription?: string;
  ipnCallbackUrl?: string;
  isFixedRate?: boolean;
  isFeePaidByUser?: boolean;
}

export interface NowPayment {
  payment_id: string | number;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id?: string;
  actually_paid?: number;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  if (!env.nowPayments.apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not configured");
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      "x-api-key": env.nowPayments.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data as { message?: string })?.message || `NOWPayments HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function getStatus(): Promise<boolean> {
  await request<{ message: string }>("GET", "/status");
  return true;
}

export async function createPayment(
  args: CreatePaymentArgs
): Promise<NowPayment> {
  const body: Record<string, unknown> = {
    price_amount: args.priceAmount,
    price_currency: args.priceCurrency.toLowerCase(),
    pay_currency: args.payCurrency.toLowerCase(),
    order_id: args.orderId,
    order_description: args.orderDescription ?? "",
  };
  if (args.ipnCallbackUrl) body.ipn_callback_url = args.ipnCallbackUrl;
  if (args.isFixedRate !== undefined) body.is_fixed_rate = args.isFixedRate;
  if (args.isFeePaidByUser !== undefined)
    body.is_fee_paid_by_user = args.isFeePaidByUser;

  return request<NowPayment>("POST", "/payment", body);
}

export async function getPaymentStatus(
  paymentId: string | number
): Promise<NowPayment> {
  return request<NowPayment>(
    "GET",
    `/payment/${encodeURIComponent(String(paymentId))}`
  );
}

/**
 * Verify the IPN signature. NOWPayments signs the request with HMAC-SHA512
 * over the key-sorted JSON body, using the store IPN secret, in the
 * `x-nowpayments-sig` header.
 */
export function verifyIpnSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = env.nowPayments.ipnSecret;
  if (!secret || !signature) return false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const sorted = sortedJsonStringify(parsed);
  const expected = crypto
    .createHmac("sha512", secret)
    .update(sorted)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature.trim())
    );
  } catch {
    return false;
  }
}

/** Recursively key-sort an object and JSON-stringify it (matches NOWPayments). */
function sortedJsonStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

/** Map a NOWPayments status string onto our OrderStatus enum. */
export function mapPaymentStatus(
  status: string
): "PENDING" | "WAITING" | "CONFIRMING" | "PARTIALLY_PAID" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED" {
  switch (status.toLowerCase()) {
    case "finished":
    case "confirmed":
      return "PAID";
    case "confirming":
    case "sending":
      return "CONFIRMING";
    case "partially_paid":
      return "PARTIALLY_PAID";
    case "waiting":
      return "WAITING";
    case "failed":
      return "FAILED";
    case "expired":
      return "EXPIRED";
    case "refunded":
      return "REFUNDED";
    default:
      return "PENDING";
  }
}
