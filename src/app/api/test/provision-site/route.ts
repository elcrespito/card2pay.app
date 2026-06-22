import { env } from "@/lib/env";
import { ensureMerchantSite } from "@/lib/sandbox-demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sandbox-only: register a WooCommerce store and return API credentials for the WP plugin.
export async function POST(req: Request) {
  if (!env.sandbox) {
    return new Response("sandbox disabled", { status: 404 });
  }

  let body: { name?: string; domain?: string; callbackUrl?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const domain = (body.domain || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const callbackUrl = body.callbackUrl || "";
  const name = body.name || domain;

  if (!domain || !callbackUrl) {
    return new Response("domain and callbackUrl required", { status: 400 });
  }

  const site = await ensureMerchantSite({ name, domain, callbackUrl });

  return Response.json({
    ok: true,
    name: site.name,
    domain: site.domain,
    apiKey: site.apiKey,
    apiSecret: site.apiSecret,
    callbackUrl: site.callbackUrl,
    card2payUrl: env.appUrl,
    pluginSettings: {
      base_url: env.appUrl,
      api_key: site.apiKey,
      api_secret: site.apiSecret,
    },
  });
}
