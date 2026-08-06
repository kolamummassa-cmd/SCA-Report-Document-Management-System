/**
 * Opaque refresh-token generation + hashing.
 *
 * Refresh tokens are high-entropy random strings (not JWTs) so they can be
 * revoked server-side by deleting/marking their `sessions` row. We store a
 * SHA-256 hash (not the raw token) in the database — deterministic hashing
 * (rather than bcrypt) is appropriate here because the input already has
 * 256 bits of entropy; the goal is "don't store the bearer secret in
 * plaintext," not "resist brute force of a low-entropy input."
 */

import { randomBytes, createHash } from "crypto";

export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
