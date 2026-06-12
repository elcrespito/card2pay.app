import { prisma } from "@/lib/db";
import { verifyCallbackSignature } from "@/lib/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A stand-in for a client site's webhook endpoint. Point a MerchantSite's
// callbackUrl at {APP_URL}/api/test/callback-sink to exercise the full
// hash -> payment -> IPN -> callback loop without a real WordPress install.
// Records every delivery (and whether the HMAC signature verified) so the test
// outcome can be inspected from the admin UI.
export async function POST(req: Request) {
  const raw = await req.text();
  const apiKey = req.headers.get("x-card2pay-apikey");
  const signature = req.headers.get("x-card2pay-signature");

  let signatureOk = false;
  if (apiKey) {
    const site = await prisma.merchantSite.findUnique({ where: { apiKey } });
    if (site) signatureOk = verifyCallbackSignature(site.apiSecret, raw, signature);
  }

  let body: unknown = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = { _unparsed: raw.slice(0, 1000) };
  }

  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    if (k.startsWith("x-card2pay") || k === "content-type") headers[k] = v;
  });

  await prisma.callbackLog.create({
    data: {
      apiKey: apiKey ?? null,
      signatureOk,
      headers: headers as object,
      body: body as object,
    },
  });

  if (!signatureOk) {
    return new Response("invalid signature", { status: 401 });
  }
  return new Response("ok", { status: 200 });
}
