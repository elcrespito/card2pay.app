# Card2pay for WooCommerce

A WooCommerce payment gateway that sends orders to the Card2pay hosted checkout
and marks them paid when Card2pay confirms the payment.

## How it works

1. At checkout, the plugin builds an encrypted **order hash** (AES-256-GCM,
   keyed by your API secret) and redirects the customer to
   `https://<card2pay>/pay/h/<hash>`.
2. Card2pay decodes the hash, creates a NOWPayments deposit, and shows the
   checkout (crypto and/or card-to-crypto via BuyCoin).
3. When NOWPayments confirms the payment, Card2pay POSTs a **signed callback**
   (HMAC-SHA256) to `/wp-json/card2pay/v1/callback`, and the plugin marks the
   WooCommerce order complete.

## Install

1. Copy the `card2pay/` folder into `wp-content/plugins/`.
2. Activate **Card2pay for WooCommerce** in WP Admin → Plugins.
3. WooCommerce → Settings → Payments → **Card2pay** → enter:
   - **Card2pay URL** — e.g. your test URL or `https://card2pay.app`
   - **API key** / **API secret** — from the Card2pay dashboard → Sites (API)
4. In the Card2pay dashboard, set the site **Callback URL** to
   `https://<your-store>/wp-json/card2pay/v1/callback` (the plugin also sends
   this automatically per order).

The hash format and signature scheme are defined in `src/lib/gateway.ts`.
