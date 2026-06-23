import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Serves the BuyCoin widget runtime config as JavaScript so the static
 * `widget.html` (embedded in an iframe) can read the token + options from
 * environment variables without baking secrets into the static file.
 */
export async function GET() {
  const w = env.widget;
  const config = {
    token: w.token,
    exchangerUrl: w.exchangerUrl,
    currencyFrom: w.currencyFrom,
    currencyTo: w.currencyTo,
    locale: w.locale,
    layout: w.layout,
    theme: w.theme,
    allowedReferrer: w.allowedReferrer,
  };

  const body = `window.CARD2PAY_CONFIG = ${JSON.stringify(config)};`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
