"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireActiveUser } from "@/lib/auth";
import { generateSlug } from "@/lib/ids";
import { env } from "@/lib/env";
import {
  encodeOrderHash,
  generateSiteCredentials,
  orderPayloadSchema,
} from "@/lib/gateway";

export type FormState = { error?: string; ok?: boolean } | undefined;
export type HashState = { error?: string; url?: string } | undefined;

const linkSchema = z.object({
  title: z.string().min(2, "Add a short title").max(140),
  description: z.string().max(500).optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0").max(1_000_000),
  currency: z.string().min(3).max(3).default("USD"),
  type: z.enum(["ONE_TIME", "REUSABLE"]),
});

export async function createLinkAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireActiveUser();

  const parsed = linkSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    amount: formData.get("amount"),
    currency: String(formData.get("currency") || "USD").toUpperCase(),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Generate a unique slug (retry on the rare collision).
  let slug = generateSlug();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.paymentLink.findUnique({ where: { slug } });
    if (!exists) break;
    slug = generateSlug();
  }

  await prisma.paymentLink.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      type: parsed.data.type,
      creatorId: user.id,
    },
  });

  revalidatePath("/dashboard/links");
  redirect("/dashboard/links");
}

export async function toggleLinkAction(formData: FormData): Promise<void> {
  const user = await requireActiveUser();
  const id = String(formData.get("id") || "");
  const link = await prisma.paymentLink.findUnique({ where: { id } });
  if (!link || link.creatorId !== user.id) return;

  await prisma.paymentLink.update({
    where: { id },
    data: { status: link.status === "ACTIVE" ? "DISABLED" : "ACTIVE" },
  });
  revalidatePath("/dashboard/links");
}

const payoutSchema = z.object({
  payoutMethod: z.string().max(80).optional(),
  payoutAddress: z.string().max(200).optional(),
  payoutNotes: z.string().max(500).optional(),
  name: z.string().min(2).max(120),
  company: z.string().max(160).optional(),
});

export async function updatePayoutSettingsAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireActiveUser();

  const parsed = payoutSchema.safeParse({
    payoutMethod: formData.get("payoutMethod") || undefined,
    payoutAddress: formData.get("payoutAddress") || undefined,
    payoutNotes: formData.get("payoutNotes") || undefined,
    name: formData.get("name"),
    company: formData.get("company") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      company: parsed.data.company,
      payoutMethod: parsed.data.payoutMethod,
      payoutAddress: parsed.data.payoutAddress,
      payoutNotes: parsed.data.payoutNotes,
    },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

// ---- Integrated client sites (API) -------------------------------------

const siteSchema = z.object({
  name: z.string().min(2, "Add a site name").max(120),
  domain: z.string().max(160).optional(),
  callbackUrl: z
    .string()
    .url("Callback must be a valid URL")
    .max(400)
    .optional()
    .or(z.literal("")),
});

export async function createSiteAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireActiveUser();

  const parsed = siteSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain") || undefined,
    callbackUrl: String(formData.get("callbackUrl") || ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { apiKey, apiSecret } = generateSiteCredentials();
  await prisma.merchantSite.create({
    data: {
      name: parsed.data.name,
      domain: parsed.data.domain,
      callbackUrl: parsed.data.callbackUrl || null,
      apiKey,
      apiSecret,
      ownerId: user.id,
    },
  });

  revalidatePath("/dashboard/sites");
  return { ok: true };
}

export async function updateSiteAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireActiveUser();
  const id = String(formData.get("id") || "");
  const site = await prisma.merchantSite.findUnique({ where: { id } });
  if (!site || site.ownerId !== user.id) return { error: "Site not found." };

  const parsed = siteSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain") || undefined,
    callbackUrl: String(formData.get("callbackUrl") || ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.merchantSite.update({
    where: { id },
    data: {
      name: parsed.data.name,
      domain: parsed.data.domain,
      callbackUrl: parsed.data.callbackUrl || null,
    },
  });
  revalidatePath("/dashboard/sites");
  return { ok: true };
}

export async function toggleSiteAction(formData: FormData): Promise<void> {
  const user = await requireActiveUser();
  const id = String(formData.get("id") || "");
  const site = await prisma.merchantSite.findUnique({ where: { id } });
  if (!site || site.ownerId !== user.id) return;
  await prisma.merchantSite.update({
    where: { id },
    data: { status: site.status === "ACTIVE" ? "DISABLED" : "ACTIVE" },
  });
  revalidatePath("/dashboard/sites");
}

export async function rotateSiteSecretAction(formData: FormData): Promise<void> {
  const user = await requireActiveUser();
  const id = String(formData.get("id") || "");
  const site = await prisma.merchantSite.findUnique({ where: { id } });
  if (!site || site.ownerId !== user.id) return;
  const { apiSecret } = generateSiteCredentials();
  await prisma.merchantSite.update({ where: { id }, data: { apiSecret } });
  revalidatePath("/dashboard/sites");
}

const testHashSchema = z.object({
  siteId: z.string().min(1),
  order_id: z.string().min(1).max(128),
  amount: z.coerce.number().positive().max(1_000_000),
  currency: z.string().min(3).max(3).default("USD"),
  email: z.string().email().optional().or(z.literal("")),
});

// Build a ready-to-open checkout URL for a sample order, so a merchant can test
// the integration without writing any code.
export async function generateTestHashAction(
  _prev: HashState,
  formData: FormData
): Promise<HashState> {
  const user = await requireActiveUser();

  const parsed = testHashSchema.safeParse({
    siteId: formData.get("siteId"),
    order_id: formData.get("order_id"),
    amount: formData.get("amount"),
    currency: String(formData.get("currency") || "USD").toUpperCase(),
    email: String(formData.get("email") || ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const site = await prisma.merchantSite.findUnique({
    where: { id: parsed.data.siteId },
  });
  if (!site || site.ownerId !== user.id) return { error: "Site not found." };

  const payload = orderPayloadSchema.parse({
    order_id: parsed.data.order_id,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    email: parsed.data.email || undefined,
    ts: Date.now(),
  });

  const hash = encodeOrderHash(site.apiKey, site.apiSecret, payload);
  return { url: `${env.appUrl}/pay/h/${hash}` };
}
