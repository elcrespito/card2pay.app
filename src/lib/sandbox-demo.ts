import "server-only";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  encodeOrderHash,
  decodeOrderHash,
  generateSiteCredentials,
  type OrderPayload,
} from "@/lib/gateway";
import { startSiteOrder, settleOrderPaid } from "@/lib/orders";

const DEMO_SITE_NAME = "Sandbox Demo";

export interface SandboxE2EResult {
  ok: boolean;
  steps: {
    hashGenerated: boolean;
    orderCreated: boolean;
    paymentSimulated: boolean;
    callbackReceived: boolean;
    callbackSignatureValid: boolean;
  };
  externalOrderId: string;
  reference: string;
  amount: number;
  currency: string;
  hashUrl: string;
  checkoutUrl: string;
  callbackBody?: unknown;
  callbackStatus?: string;
  error?: string;
}

/** Ensure a demo MerchantSite exists (callback → test sink). Sandbox only. */
export async function ensureSandboxDemoSite() {
  const existing = await prisma.merchantSite.findFirst({
    where: { name: DEMO_SITE_NAME },
  });
  if (existing) return existing;

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) throw new Error("No admin user found to own the demo site.");

  const { apiKey, apiSecret } = generateSiteCredentials();
  return prisma.merchantSite.create({
    data: {
      name: DEMO_SITE_NAME,
      domain: "sandbox-demo.local",
      callbackUrl: `${env.appUrl}/api/test/callback-sink`,
      apiKey,
      apiSecret,
      ownerId: admin.id,
    },
  });
}

/** Find or create a merchant site for sandbox store integration testing. */
export async function ensureMerchantSite(opts: {
  name: string;
  domain: string;
  callbackUrl: string;
}) {
  const existing = await prisma.merchantSite.findFirst({
    where: {
      OR: [{ domain: opts.domain }, { name: opts.name }],
    },
  });
  if (existing) {
    if (
      existing.callbackUrl !== opts.callbackUrl ||
      existing.domain !== opts.domain ||
      existing.name !== opts.name
    ) {
      return prisma.merchantSite.update({
        where: { id: existing.id },
        data: {
          callbackUrl: opts.callbackUrl,
          domain: opts.domain,
          name: opts.name,
        },
      });
    }
    return existing;
  }

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) throw new Error("No admin user found.");

  const { apiKey, apiSecret } = generateSiteCredentials();
  return prisma.merchantSite.create({
    data: {
      name: opts.name,
      domain: opts.domain,
      callbackUrl: opts.callbackUrl,
      apiKey,
      apiSecret,
      ownerId: admin.id,
    },
  });
}

/**
 * One-click end-to-end sandbox test:
 *   hash → decode → order → simulate PAID → signed callback → test sink
 */
export async function runSandboxE2ETest(): Promise<SandboxE2EResult> {
  if (!env.sandbox) {
    return {
      ok: false,
      steps: {
        hashGenerated: false,
        orderCreated: false,
        paymentSimulated: false,
        callbackReceived: false,
        callbackSignatureValid: false,
      },
      externalOrderId: "",
      reference: "",
      amount: 0,
      currency: "USD",
      hashUrl: "",
      checkoutUrl: "",
      error: "Sandbox mode is disabled.",
    };
  }

  const site = await ensureSandboxDemoSite();
  const externalOrderId = `DEMO-${Date.now()}`;
  const amount = 9.99;
  const currency = "USD";

  const payload: OrderPayload = {
    order_id: externalOrderId,
    amount,
    currency,
    description: "Sandbox one-click demo order",
    email: "demo@test.card2pay.app",
    callback_url: `${env.appUrl}/api/test/callback-sink`,
    return_url: `${env.appUrl}/test?done=1`,
    ts: Date.now(),
  };

  const hash = encodeOrderHash(site.apiKey, site.apiSecret, payload);
  const hashUrl = `${env.appUrl}/pay/h/${hash}`;

  try {
    const { site: decodedSite, payload: decodedPayload } =
      await decodeOrderHash(hash);
    const order = await startSiteOrder(decodedSite, decodedPayload, {
      skipPayment: true,
    });

    await settleOrderPaid(order.id);

    const updated = await prisma.order.findUnique({ where: { id: order.id } });
    const logs = await prisma.callbackLog.findMany({
      where: { apiKey: site.apiKey },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const newLog = logs.find((l) => {
      const body = l.body as { order_id?: string } | null;
      return body?.order_id === externalOrderId;
    });

    const callbackReceived = !!newLog;
    const callbackSignatureValid = newLog?.signatureOk ?? false;

    return {
      ok:
        updated?.status === "PAID" &&
        updated.callbackStatus === "SENT" &&
        callbackSignatureValid,
      steps: {
        hashGenerated: true,
        orderCreated: true,
        paymentSimulated: updated?.status === "PAID",
        callbackReceived,
        callbackSignatureValid,
      },
      externalOrderId,
      reference: order.reference,
      amount,
      currency,
      hashUrl,
      checkoutUrl: `${env.appUrl}/pay/o/${order.reference}`,
      callbackBody: newLog?.body ?? undefined,
      callbackStatus: updated?.callbackStatus ?? undefined,
      error:
        updated?.status !== "PAID"
          ? "Order did not reach PAID."
          : updated.callbackStatus !== "SENT"
            ? `Callback delivery: ${updated.callbackStatus}`
            : !callbackSignatureValid
              ? "Callback signature invalid."
              : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      steps: {
        hashGenerated: true,
        orderCreated: false,
        paymentSimulated: false,
        callbackReceived: false,
        callbackSignatureValid: false,
      },
      externalOrderId,
      reference: "",
      amount,
      currency,
      hashUrl,
      checkoutUrl: "",
      error: e instanceof Error ? e.message : "Test failed.",
    };
  }
}
