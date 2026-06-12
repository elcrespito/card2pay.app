import { NextResponse } from "next/server";
import { decodeOrderHash, GatewayError } from "@/lib/gateway";
import { startSiteOrder } from "@/lib/orders";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Entry point for integrated client sites: they redirect the customer to
//   {APP_URL}/pay/h/<hash>
// We decode the hash, create/reuse the order + deposit, then forward the
// customer to the hosted checkout.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;

  try {
    const { site, payload } = await decodeOrderHash(hash);
    const order = await startSiteOrder(site, payload);
    return NextResponse.redirect(`${env.appUrl}/pay/o/${order.reference}`, 303);
  } catch (e) {
    const message =
      e instanceof GatewayError
        ? e.message
        : "We could not start this payment. Please return to the store and try again.";
    const url = new URL(`${env.appUrl}/pay/error`);
    url.searchParams.set("reason", message);
    return NextResponse.redirect(url.toString(), 303);
  }
}
