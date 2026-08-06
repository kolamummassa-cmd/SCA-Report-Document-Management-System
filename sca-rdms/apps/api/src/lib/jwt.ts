/**
 * JWT utilities.
 *
 * Two distinct token families:
 *  - Access tokens: short-lived, sent as a Bearer header, identify the
 *    authenticated user + role for RBAC checks (see middleware/authenticate.ts).
 *  - Purpose tokens: short-lived, single-purpose tokens embedded in emailed
 *    links (password reset, email verification). Stateless by design — no
 *    dedicated DB table, matching the SRS's JWT-based auth requirement.
 *
 * Refresh tokens are NOT JWTs — see lib/tokens.ts. They're opaque random
 * strings backed by the `sessions` table so they can be individually revoked.
 */

import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string; // user id
  roleId: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export type PurposeTokenType = "password_reset" | "email_verification";

export interface PurposeTokenPayload {
  sub: string; // user id
  purpose: PurposeTokenType;
}

export function signPurposeToken(payload: PurposeTokenPayload, expiresIn: string): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn } as SignOptions);
}

export function verifyPurposeToken(token: string, expectedPurpose: PurposeTokenType): PurposeTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as PurposeTokenPayload;
  if (decoded.purpose !== expectedPurpose) {
    throw new Error("Token purpose mismatch");
  }
  return decoded;
}
