# Card2pay → kronen-peptide.net (dev test)

## 1. Site registered on dev.card2pay

Use these in WooCommerce → Payments → Card2pay:

| Setting | Value |
|---------|--------|
| **Card2pay URL** | `https://dev.card2pay.app` |
| **API key** | *(from dashboard or provision API — see below)* |
| **API secret** | *(same)* |
| **Enable** | Yes (for testing only) |

**Webhook URL** (shown in plugin settings):

```
https://kronen-peptide.net/wp-json/card2pay/v1/callback
```

Register / refresh the site in Card2pay:

```bash
curl -X POST https://dev.card2pay.app/api/test/provision-site \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kronen Peptide NET",
    "domain": "kronen-peptide.net",
    "callbackUrl": "https://kronen-peptide.net/wp-json/card2pay/v1/callback"
  }'
```

Response includes `apiKey` and `apiSecret` for the plugin.

## 2. Install plugin

1. Upload `card2pay-wp-plugin.zip` to WP → Plugins → Add New → Upload.
2. Activate **Card2pay for WooCommerce**.
3. WooCommerce → Settings → Payments → Card2pay → paste URL + keys → Save.

## 3. Test order (no real payment)

1. Place a test order on kronen-peptide.net, pay with **Card2pay**.
2. You are redirected to `https://dev.card2pay.app/pay/h/...` then checkout.
3. On checkout click **「Simulate payment (mark as paid)」** (sandbox only).
4. Card2pay POSTs `order.paid` to your WP webhook → WooCommerce order becomes **Processing/Completed**.

## 4. Verify

- **dev.card2pay.app** → Admin → Integrations → callback log (signature: valid).
- **WooCommerce** → order note: `Card2pay payment confirmed (C2P-...)`.

## Flow

```
WooCommerce checkout
  → plugin builds hash
  → dev.card2pay.app/pay/h/{hash}
  → order + checkout
  → [Simulate payment]
  → POST kronen-peptide.net/wp-json/card2pay/v1/callback
  → order paid in WooCommerce
```
