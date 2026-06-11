# Card2pay — Payment platform

Card2pay is an enterprise **pay-by-link** platform. Merchants sign up, get
approved, and create payment links. Each link is paid by card and settled in
crypto via **NOWPayments**; funds land in the company wallet, every order is
tracked by ID and attributed to its creator, and admins record manual payouts
to merchants from a built-in CMS.

> Card2pay is **not available to U.S. citizens or residents** — this is shown
> on the public landing, checkout, and sign-up.

## Stack

- **Next.js 15** (App Router, server actions) + **React 19**
- **Prisma** + **PostgreSQL**
- Custom session auth (JWT in an httpOnly cookie via `jose`, `bcryptjs`)
- **Tailwind CSS** (dark / gold enterprise theme)
- **NOWPayments** for card-to-crypto settlement + IPN confirmation
- **BuyCoin (Extop)** widget for the hosted card checkout (embedded via `public/widget.html`)
- Docker (Next standalone) for Coolify

## How a payment works

1. A merchant creates a payment link (amount, one-time or reusable).
2. They share `https://card2pay.app/pay/<slug>` with a customer.
3. The customer confirms (incl. the U.S. exclusion) and starts the payment.
4. We call NOWPayments `create_payment` → a unique deposit address + crypto amount.
5. The BuyCoin widget (embedded) is prefilled with that address + amount; the
   customer pays by card.
6. NOWPayments posts an **IPN webhook** (`/api/webhooks/nowpayments`, HMAC-SHA512
   signed) → the order is confirmed and attributed to the merchant.
7. Funds settle to the company wallet configured in NOWPayments. Admin marks the
   manual payout to the merchant as sent.

Backward compatible: external integrations (peptide-shop, the WooCommerce
plugin) that redirect to `https://card2pay.app/?amount=&wallet=&email=` still get
the hosted widget checkout.

## Routes

| Area | Path |
| --- | --- |
| Landing | `/` |
| Auth | `/login`, `/signup` |
| Merchant | `/dashboard`, `/dashboard/links`, `/dashboard/orders`, `/dashboard/settings` |
| Admin CMS | `/admin`, `/admin/merchants`, `/admin/links`, `/admin/orders` |
| Public checkout | `/pay/<slug>`, `/pay/o/<reference>` |
| Widget config | `/api/widget-config` |
| NOWPayments IPN | `/api/webhooks/nowpayments` |
| CSV export | `/admin/orders/export` |

## Local development

```bash
cp .env.example .env        # fill in secrets
npm install
# start Postgres (any way you like), then:
npx prisma db push
npm run seed                # creates the admin from ADMIN_* env
npm run dev                 # http://localhost:3000
```

Or run everything with Docker:

```bash
docker compose up --build
```

The first admin login uses `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Environment variables

See `.env.example`. Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Signs session cookies (long random string) |
| `APP_URL` | Public base URL (used for IPN callback + share links) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Bootstrapped admin |
| `REQUIRE_APPROVAL` | New merchants need admin approval (default `true`) |
| `NOWPAYMENTS_API_KEY` | NOWPayments API key |
| `NOWPAYMENTS_IPN_SECRET` | Verifies IPN webhooks |
| `NOWPAYMENTS_PAY_CURRENCY` | Settlement crypto, e.g. `usdttrc20` |
| `NOWPAYMENTS_PRICE_CURRENCY` | Fiat pricing currency, e.g. `usd` |
| `BUYCOIN_WIDGET_TOKEN` | BuyCoin widget token |

After deploy, set the NOWPayments **IPN callback URL** to:

```
https://card2pay.app/api/webhooks/nowpayments
```

## Deploy on Coolify

1. Point the app at this repo; build with the included `Dockerfile`.
2. Add a PostgreSQL service and set `DATABASE_URL`.
3. Set the environment variables above.
4. On boot, the container runs `prisma db push` + seeds the admin, then starts.
5. Set the domain to `card2pay.app` and the NOWPayments IPN URL as above.

> Note: the first deploy uses `prisma db push`. Once the schema stabilises,
> commit migrations under `prisma/migrations` and the entrypoint will switch to
> `prisma migrate deploy` automatically.
