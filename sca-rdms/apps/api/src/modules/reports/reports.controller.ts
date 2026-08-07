import type { Request, Response, NextFunction } from "express";
import { reportsService } from "./reports.service";
import { filesService } from "../files/files.service";
import { prisma } from "../../lib/prisma";

async function roleNameFor(roleId: string): Promise<string> {
  const role = await prisma.role.findUniqueOrThrow({ where: { id: roleId } });
  return role.name;
}

export const reportsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.createReport(req.body, req.user!);
      res.status(201).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const roleName = await roleNameFor(req.user!.roleId);
      const result = await reportsService.listReports(
        { ...req.user!, roleName },
        {
          status: req.query.status as string | undefined,
          reportTypeId: req.query.reportTypeId as string | undefined,
          programmeId: req.query.programmeId as string | undefined,
          projectId: req.query.projectId as string | undefined,
          departmentId: req.query.departmentId as string | undefined,
          page: req.query.page ? Number(req.query.page) : undefined,
          pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        }
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.getReport(req.params.id);
      res.status(200).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.updateReport(req.params.id, req.body, req.user!);
      res.status(200).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.submitReport(req.params.id, req.user!);
      res.status(200).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.decideApproval(req.params.id, "APPROVED", req.body?.remarks, req.user!);
      res.status(200).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.decideApproval(req.params.id, "REJECTED", req.body?.remarks, req.user!);
      res.status(200).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async listRevisions(req: Request, res: Response, next: NextFunction) {
    try {
      const revisions = await reportsService.listRevisions(req.params.id);
      res.status(200).json({ data: revisions });
    } catch (err) {
      next(err);
    }
  },

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await reportsService.addComment(req.params.id, req.user!, req.body.body);
      res.status(201).json({ data: comment });
    } catch (err) {
      next(err);
    }
  },

  async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { code: "NO_FILE", message: "No file was uploaded." } });
      }
      const fileRecord = await filesService.storeUpload(
        { originalName: req.file.originalname, buffer: req.file.buffer, mimeTypeHint: req.file.mimetype },
        req.user!.id
      );
      await reportsService.attachFile(req.params.id, fileRecord.id);
      return res.status(201).json({ data: fileRecord });
    } catch (err) {
      return next(err);
    }
  },
};
