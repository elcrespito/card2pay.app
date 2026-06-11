import crypto from "node:crypto";

// Unambiguous alphabet (no 0/O/1/I).
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomCode(length: number): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Public, shareable link slug, e.g. "k7m2qf9x". */
export function generateSlug(): string {
  return randomCode(10).toLowerCase();
}

/** Human-friendly order reference, e.g. "C2P-8F3K2Q". */
export function generateOrderReference(): string {
  return `C2P-${randomCode(6)}`;
}
