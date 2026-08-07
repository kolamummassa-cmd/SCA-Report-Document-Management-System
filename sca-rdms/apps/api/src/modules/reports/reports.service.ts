import { prisma } from "../../lib/prisma";
import { reportsRepository } from "./reports.repository";
import { withUniqueReportNumber } from "./report-numbering.service";
import { AppError } from "../../middleware/error-handler";
import type { CreateReportInput, UpdateReportInput } from "@sca-rdms/shared-schemas";

interface AuthUser {
  id: string;
  roleId: string;
  email: string;
}

// Roles whose "report:read" grant means org-wide visibility rather than
// "only my own reports" (see SRS section 5, Permission Matrix). Encoded here
// rather than in the coarse resource:action permission model, which has no
// concept of data scope.
const BROAD_VISIBILITY_ROLES = new Set([
  "SUPER_ADMIN",
  "EXECUTIVE_DIRECTOR",
  "ME_OFFICER",
  "FINANCE_OFFICER",
  "HR_OFFICER",
]);

async function resolveApprovalChain(reportTypeId: string): Promise<{ stepOrder: number; approverId: string }[]> {
  const reportType = await prisma.reportType.findUniqueOrThrow({ where: { id: reportTypeId } });
  const roleNames = (reportType.approvalChainTemplate as string[]) ?? [];

  const steps: { stepOrder: number; approverId: string }[] = [];
  for (let i = 0; i < roleNames.length; i++) {
    const approver = await reportsRepository.findFirstActiveUserWithRoleName(roleNames[i]);
    if (!approver) {
      // Don't silently skip a step — a report with a broken approval chain
      // should fail loudly at submit time, not disappear into a black hole.
      throw new AppError(
        `No active user found with role "${roleNames[i]}" to approve this report type.`,
        409
      );
    }
    steps.push({ stepOrder: i + 1, approverId: approver.id });
  }
  return steps;
}

export const reportsService = {
  async createReport(input: CreateReportInput, user: AuthUser) {
    return withUniqueReportNumber((reportNumber) =>
      reportsRepository.create({
        ...input,
        reportNumber,
        preparedById: user.id,
        status: "DRAFT",
      })
    );
  },

  async getReport(id: string) {
    const report = await reportsRepository.findById(id);
    if (!report) throw new AppError("Report not found.", 404);
    return report;
  },

  async updateReport(id: string, input: UpdateReportInput, user: AuthUser) {
    const existing = await reportsRepository.findById(id);
    if (!existing) throw new AppError("Report not found.", 404);

    if (!["DRAFT", "REJECTED"].includes(existing.status)) {
      throw new AppError("Only draft or rejected reports can be edited.", 409);
    }
    if (existing.preparedById !== user.id) {
      throw new AppError("You can only edit reports you prepared.", 403);
    }

    return reportsRepository.update(id, input);
  },

  async submitReport(id: string, user: AuthUser) {
    const existing = await reportsRepository.findById(id);
    if (!existing) throw new AppError("Report not found.", 404);
    if (!["DRAFT", "REJECTED"].includes(existing.status)) {
      throw new AppError("Only draft or rejected reports can be submitted.", 409);
    }
    if (existing.preparedById !== user.id) {
      throw new AppError("You can only submit reports you prepared.", 403);
    }

    // FR-2.4: immutable snapshot on every submission.
    const versionNumber = (await reportsRepository.countRevisions(id)) + 1;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { approvals: _a, comments: _c, files: _f, ...rest } = existing as Record<string, unknown> & {
      approvals: unknown;
      comments: unknown;
      files: unknown;
    };
    // Round-trip through JSON so Decimal/Date instances become plain
    // JSON-safe values before Prisma stores them in the `Json` column.
    const snapshot = JSON.parse(JSON.stringify(rest));
    await reportsRepository.createRevisionSnapshot(id, versionNumber, snapshot, user.id);

    const steps = await resolveApprovalChain(existing.reportTypeId);
    await reportsRepository.createApprovalSteps(id, steps);

    return reportsRepository.update(id, { status: "SUBMITTED" });
  },

  async decideApproval(
    reportId: string,
    decision: "APPROVED" | "REJECTED",
    remarks: string | undefined,
    user: AuthUser
  ) {
    const report = await reportsRepository.findById(reportId);
    if (!report) throw new AppError("Report not found.", 404);
    if (report.status !== "SUBMITTED") {
      throw new AppError("Only submitted reports can be approved or rejected.", 409);
    }

    const pending = await reportsRepository.findFirstPendingApproval(reportId);
    if (!pending) {
      throw new AppError("There is no pending approval step for this report.", 409);
    }
    if (pending.approverId !== user.id) {
      throw new AppError("This report is awaiting approval from a different approver.", 403);
    }

    await reportsRepository.updateApproval(pending.id, decision, remarks);

    if (decision === "REJECTED") {
      return reportsRepository.update(reportId, { status: "REJECTED" });
    }

    const nextPending = await reportsRepository.findFirstPendingApproval(reportId);
    if (!nextPending) {
      // That was the last step in the chain.
      return reportsRepository.update(reportId, { status: "APPROVED" });
    }
    // Still awaiting a later step — status stays SUBMITTED.
    return reportsRepository.findById(reportId);
  },

  async listReports(
    user: AuthUser & { roleName: string },
    filters: {
      status?: string;
      reportTypeId?: string;
      programmeId?: string;
      projectId?: string;
      departmentId?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 25, 100);

    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.reportTypeId) where.reportTypeId = filters.reportTypeId;
    if (filters.programmeId) where.programmeId = filters.programmeId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.departmentId) where.departmentId = filters.departmentId;

    if (!BROAD_VISIBILITY_ROLES.has(user.roleName)) {
      // Project Officers / Staff / Programme Managers see their own reports
      // plus anything they're the assigned approver for.
      where.OR = [{ preparedById: user.id }, { approvals: { some: { approverId: user.id } } }];
    }

    const { items, totalItems } = await reportsRepository.list(where, page, pageSize);
    return {
      data: items,
      meta: { page, pageSize, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)) },
    };
  },

  async listRevisions(reportId: string) {
    return reportsRepository.listRevisions(reportId);
  },

  async addComment(reportId: string, user: AuthUser, body: string) {
    const report = await reportsRepository.findById(reportId);
    if (!report) throw new AppError("Report not found.", 404);
    return reportsRepository.addComment(reportId, user.id, body);
  },

  async attachFile(reportId: string, fileId: string) {
    return reportsRepository.attachFile(reportId, fileId);
  },
};
