import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { settleOrderPaid } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sandbox-only: simulate a confirmed payment so the full
//   order -> PAID -> client-site callback
// loop can be exercised without a real NOWPayments deposit. Disabled unless
// SANDBOX_MODE=true (never enable in production).
export async function POST(req: Request) {
  if (!env.sandbox) {
    return new Response("sandbox disabled", { status: 404 });
  }

  let reference: string | null = null;
  try {
    const body = (await req.json()) as { reference?: string };
    reference = body.reference ?? null;
  } catch {
    reference = null;
  }
  if (!reference) {
    return new Response("missing reference", { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order) {
    return new Response("order not found", { status: 404 });
  }

  await settleOrderPaid(order.id);

  return Response.json({ ok: true, reference, status: "PAID" });
}
