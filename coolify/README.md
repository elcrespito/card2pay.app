# Coolify deploy (elcrespito/card2pay.app)

1. **+ New Resource → Docker Compose** (or edit existing app)
2. Repository: **`elcrespito/card2pay.app`**
3. Branch: `main`
4. **Base directory:** `coolify`
5. Copy `coolify/.env.example` → Environment variables in Coolify
6. Deploy

Preview URL: `https://card2pay.78.47.62.88.sslip.io`

When DNS is ready, set `CARD2PAY_HOST=card2pay.app` and `APP_URL=https://card2pay.app`.

IPN callback in NOWPayments:
`https://card2pay.app/api/webhooks/nowpayments`
