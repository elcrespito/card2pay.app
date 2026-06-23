# Kronen Secure Pay → kronen-peptide.net (dev test)

Plugin zip: **kronen-secure-pay.zip**

- WP plugin name: **Kronen Secure Pay**
- Checkout label: **Sichere Online-Zahlung** (editable in settings)
- Webhook: `https://kronen-peptide.net/wp-json/kronen-pay/v1/callback`

## Card2pay credentials (dev)

| Setting | Value |
|---------|--------|
| Payment platform URL | `https://dev.card2pay.app` |
| API key | `c2p_5174f7819378ad3268839e90` |
| API secret | `7a37f02e6e4c68d55a6fc49c6c55a4c34242e225005deac10bd419c44f5eb450` |

Update site registration:

```bash
curl -X POST https://dev.card2pay.app/api/test/provision-site \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kronen Peptide",
    "domain": "kronen-peptide.net",
    "callbackUrl": "https://kronen-peptide.net/wp-json/kronen-pay/v1/callback"
  }'
```

## Install

1. Upload **kronen-secure-pay.zip** → Activate **Kronen Secure Pay**
2. WooCommerce → Payments → **Kronen Secure Pay** → keys + Enable

## Test

1. Order on kronen-peptide.net → **Sichere Online-Zahlung**
2. dev.card2pay.app checkout → **Simulate payment**
3. Order paid in WooCommerce
