#!/bin/sh
# Renders public/config.template.js -> config.js using environment variables.
# Runs automatically via nginx's /docker-entrypoint.d/ hook before nginx starts.
set -e

: "${BUYCOIN_WIDGET_TOKEN:=}"
: "${BUYCOIN_EXCHANGER_URL:=https://buycoin.online/x/calc/exchanger.js}"
: "${WIDGET_CURRENCY_FROM:=EUR}"
: "${WIDGET_CURRENCY_TO:=USDT}"
: "${WIDGET_LOCALE:=en}"
: "${WIDGET_LAYOUT:=vertical}"
: "${WIDGET_THEME:=light}"
: "${ALLOWED_REFERRER:=peptides}"

export BUYCOIN_WIDGET_TOKEN BUYCOIN_EXCHANGER_URL WIDGET_CURRENCY_FROM \
  WIDGET_CURRENCY_TO WIDGET_LOCALE WIDGET_LAYOUT WIDGET_THEME ALLOWED_REFERRER

TEMPLATE="/usr/share/nginx/html/config.template.js"
OUTPUT="/usr/share/nginx/html/config.js"

envsubst \
  '${BUYCOIN_WIDGET_TOKEN} ${BUYCOIN_EXCHANGER_URL} ${WIDGET_CURRENCY_FROM} ${WIDGET_CURRENCY_TO} ${WIDGET_LOCALE} ${WIDGET_LAYOUT} ${WIDGET_THEME} ${ALLOWED_REFERRER}' \
  < "$TEMPLATE" > "$OUTPUT"

echo "[card2pay] config.js generated (token set: $([ -n "$BUYCOIN_WIDGET_TOKEN" ] && echo yes || echo no))"
