# Coolify deploy — card2pay.app

## Setup

1. **New Resource → Docker Compose** (or edit existing)
2. Repository: `elcrespito/card2pay.app`, branch `main`
3. **Base directory:** `coolify`
4. In **Domains** for service `app`: add `card2pay.78.47.62.88.sslip.io` (or use auto-generated URL)
5. Environment: optional overrides from `.env.example` (passwords are auto-generated)
6. **Deploy**

Image is built on GitHub Actions → `ghcr.io/elcrespito/card2pay.app:latest` (no heavy build on VPS).

## If you see 503 "no available server"

1. Open **Logs** for service `app` — container crash or image pull error?
2. Confirm GitHub Action **Publish Docker image** succeeded (Actions tab on GitHub)
3. First deploy: wait for GHCR image to exist, then **Redeploy**
4. In Coolify → app service → port must be **3000**
5. Do **not** add manual Traefik labels — Coolify uses `SERVICE_URL_APP_3000`

## Build on server (fallback)

If GHCR is unavailable, merge `docker-compose.build.yml` locally or set build in Coolify custom compose override. Needs ~2GB free RAM during `next build`.

## NOWPayments IPN

Set callback URL to your public `APP_URL`:

`https://<your-domain>/api/webhooks/nowpayments`
