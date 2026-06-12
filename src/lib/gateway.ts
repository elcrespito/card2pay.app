import "server-only";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { MerchantSite } from "@prisma/client";

/**
 * Card2pay gateway hash.
 *
 * Client sites (e.g. a WooCommerce store) describe an order as a compact,
 * tamper-proof "hash" and redirect their customer to
 *   {APP_URL}/pay/h/<hash>
 * Card2pay decodes it, creates/looks up the order, and runs the payment.
 *
 * Format (dot-separated, URL-safe):
 *   c2p1.<apiKey>.<ivB64url>.<ciphertextB64url>.<authTagB64url>
 *
 * - The payload JSON is encrypted with AES-256-GCM.
 * - The key is SHA-256(site.apiSecret); the apiKey travels in clear so we can
 *   look the site (and its secret) up before decrypting.
 * - The apiKey is bound as AES-GCM additional authenticated data (AAD), so a
 *   hash can't be replayed against a different site.
 */

const VERSION = "c2p1";

export const orderPayloadSchema = z.object({
  // The client's own order id (e.g. WooCommerce order number).
  order_id: z.string().min(1).max(128),
  amount: z.coerce.number().positive().max(1_000_000),
  currency: z.string().min(3).max(8).default("USD"),
  // Optional crypto settlement currency override (else the platform default).
  pay_currency: z.string().min(2).max(20).optional(),
  description: z.string().max(300).optional(),
  email: z.string().email().optional(),
  // Where to send the customer back after payment, and where to notify on paid.
  return_url: z.string().url().optional(),
  callback_url: z.string().url().optional(),
  // Optional client timestamp (ms) for freshness checks.
  ts: z.coerce.number().optional(),
});

export type OrderPayload = z.infer<typeof orderPayloadSchema>;

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function keyFromSecret(apiSecret: string): Buffer {
  return crypto.createHash("sha256").update(apiSecret, "utf8").digest();
}

/** Encode + encrypt an order payload into a gateway hash. Pure (no DB). */
export function encodeOrderHash(
  apiKey: string,
  apiSecret: string,
  payload: OrderPayload
): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyFromSecret(apiSecret), iv);
  cipher.setAAD(Buffer.from(apiKey, "utf8"));
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, apiKey, b64url(iv), b64url(ciphertext), b64url(tag)].join(".");
}

export interface DecodedHash {
  site: MerchantSite;
  payload: OrderPayload;
}

export class GatewayError extends Error {}

/** Look up the site by apiKey, decrypt + validate the payload. */
export async function decodeOrderHash(hash: string): Promise<DecodedHash> {
  const parts = (hash || "").split(".");
  if (parts.length !== 5 || parts[0] !== VERSION) {
    throw new GatewayError("Malformed payment link.");
  }
  const [, apiKey, ivPart, ctPart, tagPart] = parts;

  const site = await prisma.merchantSite.findUnique({ where: { apiKey } });
  if (!site || site.status !== "ACTIVE") {
    throw new GatewayError("Unknown or disabled merchant site.");
  }

  let json: string;
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      keyFromSecret(site.apiSecret),
      fromB64url(ivPart)
    );
    decipher.setAAD(Buffer.from(apiKey, "utf8"));
    decipher.setAuthTag(fromB64url(tagPart));
    const plaintext = Buffer.concat([
      decipher.update(fromB64url(ctPart)),
      decipher.final(),
    ]);
    json = plaintext.toString("utf8");
  } catch {
    // Bad key/tag/iv -> authentication failed.
    throw new GatewayError("Invalid or tampered payment link.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(json);
  } catch {
    throw new GatewayError("Invalid payment payload.");
  }

  const result = orderPayloadSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new GatewayError(
      result.error.issues[0]?.message ?? "Invalid payment payload."
    );
  }

  return { site, payload: result.data };
}

/**
 * HMAC-SHA256 signature for the outbound "order paid" callback we POST to the
 * client site. The site verifies it with the same apiSecret.
 */
export function signCallback(apiSecret: string, rawBody: string): string {
  return crypto.createHmac("sha256", apiSecret).update(rawBody, "utf8").digest("hex");
}

export function verifyCallbackSignature(
  apiSecret: string,
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const expected = signCallback(apiSecret, rawBody);
  const given = signature.replace(/^sha256=/, "").trim();
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
  } catch {
    return false;
  }
}

/** Generate a fresh apiKey / apiSecret pair for a new merchant site. */
export function generateSiteCredentials(): { apiKey: string; apiSecret: string } {
  return {
    apiKey: "c2p_" + crypto.randomBytes(12).toString("hex"),
    apiSecret: crypto.randomBytes(32).toString("hex"),
  };
}
