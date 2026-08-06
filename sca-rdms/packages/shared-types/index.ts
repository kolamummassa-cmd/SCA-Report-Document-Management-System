/**
 * Types shared between apps/web and apps/api.
 * Kept in sync with prisma/schema.prisma enums; expanded as each
 * feature module (reports, documents, etc.) is implemented.
 */

export type ReportCadence = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "AD_HOC";

export type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ARCHIVED";

export type ApprovalDecision = "PENDING" | "APPROVED" | "REJECTED";

export type DocumentStatus = "ACTIVE" | "ARCHIVED" | "DELETED";

export type SystemRole =
  | "SUPER_ADMIN"
  | "EXECUTIVE_DIRECTOR"
  | "PROGRAMME_MANAGER"
  | "PROJECT_OFFICER"
  | "ME_OFFICER"
  | "FINANCE_OFFICER"
  | "HR_OFFICER"
  | "STAFF";

/** Standard API error envelope returned by the error-handler middleware. */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Standard success envelope for list endpoints. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
