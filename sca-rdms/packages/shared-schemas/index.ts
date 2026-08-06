/**
 * Zod schemas shared between apps/web (React Hook Form resolvers) and
 * apps/api (request validation middleware) — single source of truth so
 * client and server validation never drift.
 *
 * Populated incrementally: auth schemas land in Phase 3, report/document
 * schemas in Phase 4.
 */

import { z } from "zod";

export const passwordPolicy = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordPolicy,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const requestEmailVerificationSchema = z.object({
  email: z.string().email(),
});
export type RequestEmailVerificationInput = z.infer<typeof requestEmailVerificationSchema>;
