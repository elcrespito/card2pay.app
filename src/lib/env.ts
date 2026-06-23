/**
 * Centralised, validated access to environment configuration.
 * Server-only values must never be imported into client components.
 */

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    // During `next build` some envs may be absent; throw only at runtime use.
    return "";
  }
  return v;
}

export const env = {
  appUrl:
    process.env.APP_URL?.replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000",

  sessionSecret: required("SESSION_SECRET", "dev-insecure-session-secret-change-me"),

  nowPayments: {
    apiKey: required("NOWPAYMENTS_API_KEY"),
    ipnSecret: required("NOWPAYMENTS_IPN_SECRET"),
    payCurrency: required("NOWPAYMENTS_PAY_CURRENCY", "usdttrc20"),
    priceCurrency: required("NOWPAYMENTS_PRICE_CURRENCY", "usd"),
    isFixedRate: (process.env.NOWPAYMENTS_FIXED_RATE ?? "true") === "true",
    feePaidByUser: (process.env.NOWPAYMENTS_FEE_PAID_BY_USER ?? "false") === "true",
  },

  // First admin bootstrapped by the seed script.
  admin: {
    email: required("ADMIN_EMAIL", "admin@card2pay.app"),
    password: required("ADMIN_PASSWORD", "ChangeMe!2026"),
    name: required("ADMIN_NAME", "Card2pay Admin"),
  },

  // Whether new merchant sign-ups need admin approval before creating links.
  requireApproval: (process.env.REQUIRE_APPROVAL ?? "true") === "true",

  // Test/sandbox mode: exposes a "mark as paid" button on checkout and a
  // sandbox endpoint so the full order -> paid -> site-callback loop can be
  // exercised without a real NOWPayments payment. MUST stay false in prod.
  sandbox: (process.env.SANDBOX_MODE ?? "false") === "true",

  // BuyCoin widget config surfaced to the embedded widget.html via /api/widget-config.
  widget: {
    token: process.env.BUYCOIN_WIDGET_TOKEN || "",
    exchangerUrl:
      process.env.BUYCOIN_EXCHANGER_URL ||
      "https://buycoin.online/x/calc/exchanger.js",
    currencyFrom: process.env.WIDGET_CURRENCY_FROM || "",
    currencyTo: process.env.WIDGET_CURRENCY_TO || "",
    locale: process.env.WIDGET_LOCALE || "en",
    layout: process.env.WIDGET_LAYOUT || "vertical",
    theme: process.env.WIDGET_THEME || "",
    allowedReferrer: process.env.ALLOWED_REFERRER || "*",
  },
};

export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}
