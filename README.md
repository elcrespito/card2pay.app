# Card2Pay

A single-page card→crypto payment page that embeds the **BuyCoin (Extop)**
exchange widget and drives it automatically: it prefills the amount, sets the
**receiver wallet address**, and forwards the customer to the hosted BuyCoin
payment page.

Built to sit between a merchant (e.g. **peptides**) and **NOWPayments**: the
merchant creates a NOWPayments payment, gets a generated deposit address, and
redirects the customer to Card2Pay with that address. The customer pays by card,
BuyCoin settles crypto to the NOWPayments address, and NOWPayments confirms the
payment back to the merchant.

## How it works

```
peptides checkout
   │  create NOWPayments payment → { pay_address, pay_amount, pay_currency }
   ▼
https://card2pay.app/?amount=<pay_amount>&wallet=<pay_address>
   │  - loads BuyCoin widget (exchanger.js) into #extopWidget
   │  - prefills amount, sets receiver wallet = pay_address
   │  - clicks through to the hosted /x/ex/ payment page
   ▼
BuyCoin hosted payment (customer pays by card)
   │  crypto sent to pay_address
   ▼
NOWPayments → webhook → peptides marks order paid
```

The widget is embedded exactly the way BuyCoin documents it — a `<script>` with a
`data-token` rendering into a `<div id="extopWidget">`. Because it renders into
the page DOM (not an iframe), the automation in `public/app.js` can interact with
its fields (`paymentAmount`, `exchange`, `wallet`, `confirm`).

## URL parameters

| Param    | Required | Description                                                        |
| -------- | -------- | ------------------------------------------------------------------ |
| `amount` | yes      | Amount to prefill in the widget (in `WIDGET_CURRENCY_FROM`).        |
| `wallet` | yes      | Destination crypto address (the NOWPayments-generated `pay_address`). |

The automation only runs when:

1. the `wallet` param is present, and
2. the request comes from an origin matching `ALLOWED_REFERRER` (default
   `peptides`). Set `ALLOWED_REFERRER=*` to disable this gate (e.g. for testing).

## Environment variables

See [`.env.example`](.env.example). All are injected at container start into
`public/config.js` (so no rebuild is needed to change them).

| Variable                | Default                                          | Notes                                            |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `BUYCOIN_WIDGET_TOKEN`  | _(empty)_                                        | The widget `data-token`. **Set this.**           |
| `BUYCOIN_EXCHANGER_URL` | `https://buycoin.online/x/calc/exchanger.js`     | Embeddable widget script.                        |
| `WIDGET_CURRENCY_FROM`  | `EUR`                                            | Fiat the customer pays with.                     |
| `WIDGET_CURRENCY_TO`    | `USDT`                                           | Crypto settled to `wallet`. Match the address.   |
| `WIDGET_LOCALE`         | `en`                                             | Widget language.                                 |
| `WIDGET_LAYOUT`         | `vertical`                                       | Widget layout (`vertical` / `horizontal`).       |
| `WIDGET_THEME`          | `light`                                          | Widget theme.                                    |
| `ALLOWED_REFERRER`      | `peptides`                                       | Substring the referrer host must contain, or `*`. |

## Deploy on Coolify

1. Push this folder to a Git repo and create a **new project / resource** in
   Coolify pointing at it.
2. Build pack: **Dockerfile** (this repo ships one). The container listens on
   port **80**.
3. Add the environment variables from `.env.example` in the Coolify UI (at least
   `BUYCOIN_WIDGET_TOKEN`).
4. Set the domain to **https://card2pay.app** and let Coolify issue TLS.
5. Deploy.

> Make sure the domain registered as the widget's **Website URL** in BuyCoin
> (`https://card2pay.app`) matches where you deploy, otherwise the widget may
> refuse to load.

Alternatively use the included `docker-compose.yml` (Coolify can deploy via
Compose too).

## Connecting peptides + NOWPayments

On the peptides side, when creating an order:

1. Create a payment via the NOWPayments API and read `pay_address` and
   `pay_amount` (and `pay_currency`) from the response.
2. Redirect the customer to:

   ```
   https://card2pay.app/?amount=<pay_amount>&wallet=<pay_address>
   ```

3. Set `WIDGET_CURRENCY_TO` to the same crypto/network as `pay_currency` so the
   wallet address is valid for the settled asset.
4. Keep handling the NOWPayments IPN/webhook on peptides to mark the order paid.

## Local development

```bash
# Option A: Docker (mirrors production)
cp .env.example .env          # token is prefilled
docker compose up --build
# open http://localhost:8080/?amount=100&wallet=TEST_ADDRESS
# (set ALLOWED_REFERRER=* in .env to bypass the referrer gate)

# Option B: any static server, after generating config.js once
#   envsubst < public/config.template.js > public/config.js   # or edit by hand
```

## Files

```
public/
  index.html           single page shell
  app.js               widget injection + payment automation
  styles.css           page styling
  config.template.js   env placeholders → rendered to config.js at boot
Dockerfile             nginx static image
docker-entrypoint.sh   renders config.js from env on container start
nginx.conf             static serving + no-store for config.js
docker-compose.yml     local / Coolify compose deploy
.env.example           environment variables
```
