import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const reportsRepository = {
  create(data: Prisma.ReportUncheckedCreateInput) {
    return prisma.report.create({ data });
  },

  findById(id: string) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        reportType: true,
        programme: true,
        project: true,
        department: true,
        location: true,
        preparedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvals: { orderBy: { stepOrder: "asc" }, include: { approver: { select: { id: true, firstName: true, lastName: true } } } },
        files: true,
        comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
  },

  update(id: string, data: Prisma.ReportUncheckedUpdateInput) {
    return prisma.report.update({ where: { id }, data });
  },

  async list(where: Prisma.ReportWhereInput, page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reportType: { select: { name: true } },
          programme: { select: { name: true } },
          project: { select: { name: true } },
          preparedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.report.count({ where }),
    ]);
    return { items, totalItems };
  },

  createRevisionSnapshot(reportId: string, versionNumber: number, snapshot: object, changedById: string) {
    return prisma.reportRevision.create({
      data: { reportId, versionNumber, snapshot, changedById },
    });
  },

  countRevisions(reportId: string) {
    return prisma.reportRevision.count({ where: { reportId } });
  },

  listRevisions(reportId: string) {
    return prisma.reportRevision.findMany({
      where: { reportId },
      orderBy: { versionNumber: "asc" },
      include: { changedBy: { select: { id: true, firstName: true, lastName: true } } },
    });
  },

  createApprovalSteps(reportId: string, steps: { stepOrder: number; approverId: string }[]) {
    return prisma.approval.createMany({
      data: steps.map((s) => ({ reportId, stepOrder: s.stepOrder, approverId: s.approverId })),
    });
  },

  findFirstPendingApproval(reportId: string) {
    return prisma.approval.findFirst({
      where: { reportId, decision: "PENDING" },
      orderBy: { stepOrder: "asc" },
    });
  },

  updateApproval(id: string, decision: "APPROVED" | "REJECTED", remarks: string | undefined) {
    return prisma.approval.update({
      where: { id },
      data: { decision, remarks, decidedAt: new Date() },
    });
  },

  findFirstActiveUserWithRoleName(roleName: string) {
    return prisma.user.findFirst({
      where: { isActive: true, role: { name: roleName } },
    });
  },

  addComment(reportId: string, authorId: string, body: string) {
    return prisma.comment.create({ data: { reportId, authorId, body } });
  },

  attachFile(reportId: string, fileId: string) {
    return prisma.file.update({ where: { id: fileId }, data: { reportId } });
  },
};
