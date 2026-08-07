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

// ─────────────────────────────────────────────────────────────
// Reports (Phase 4)
// ─────────────────────────────────────────────────────────────

export const createReportSchema = z.object({
  title: z.string().min(3).max(300),
  reportTypeId: z.string().uuid(),
  programmeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  locationId: z.string().uuid().optional(),
  supervisorId: z.string().uuid().optional(),
  executiveSummary: z.string().max(10_000).optional(),
  objectives: z.string().max(10_000).optional(),
  activitiesConducted: z.string().max(10_000).optional(),
  achievements: z.string().max(10_000).optional(),
  challenges: z.string().max(10_000).optional(),
  lessonsLearned: z.string().max(10_000).optional(),
  recommendations: z.string().max(10_000).optional(),
  nextSteps: z.string().max(10_000).optional(),
  beneficiariesMale: z.coerce.number().int().min(0).default(0),
  beneficiariesFemale: z.coerce.number().int().min(0).default(0),
  beneficiariesChildren: z.coerce.number().int().min(0).default(0),
  beneficiariesAdults: z.coerce.number().int().min(0).default(0),
  beneficiariesPWD: z.coerce.number().int().min(0).default(0),
  budgetAllocated: z.coerce.number().min(0).optional(),
  budgetUsed: z.coerce.number().min(0).optional(),
  isSensitive: z.coerce.boolean().default(false),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const updateReportSchema = createReportSchema.partial();
export type UpdateReportInput = z.infer<typeof updateReportSchema>;

export const approvalDecisionSchema = z.object({
  remarks: z.string().max(2000).optional(),
});
export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;

export const addCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});
export type AddCommentInput = z.infer<typeof addCommentSchema>;

// ─────────────────────────────────────────────────────────────
// Documents (Phase 4)
// ─────────────────────────────────────────────────────────────

export const createDocumentSchema = z.object({
  title: z.string().min(3).max(300),
  documentType: z.string().min(2).max(100),
  programmeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  year: z.coerce.number().int().min(2000).max(2100),
  description: z.string().max(5000).optional(),
  isSensitive: z.coerce.boolean().default(false),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => (Array.isArray(v) ? v : v ? v.split(",").map((t) => t.trim()).filter(Boolean) : [])),
  categories: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => (Array.isArray(v) ? v : v ? v.split(",").map((c) => c.trim()).filter(Boolean) : [])),
});
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const addDocumentVersionSchema = z.object({
  changeNote: z.string().max(2000).optional(),
});
export type AddDocumentVersionInput = z.infer<typeof addDocumentVersionSchema>;
