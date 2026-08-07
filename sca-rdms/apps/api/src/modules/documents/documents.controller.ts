import type { Request, Response, NextFunction } from "express";
import { documentsService } from "./documents.service";

function fileFromRequest(req: Request) {
  if (!req.file) return undefined;
  return { originalName: req.file.originalname, buffer: req.file.buffer, mimeTypeHint: req.file.mimetype };
}

export const documentsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentsService.createDocument(req.body, fileFromRequest(req), req.user!);
      res.status(201).json({ data: document });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentsService.listDocuments({
        documentType: req.query.documentType as string | undefined,
        programmeId: req.query.programmeId as string | undefined,
        projectId: req.query.projectId as string | undefined,
        departmentId: req.query.departmentId as string | undefined,
        year: req.query.year ? Number(req.query.year) : undefined,
        status: req.query.status as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentsService.getDocument(req.params.id);
      res.status(200).json({ data: document });
    } catch (err) {
      next(err);
    }
  },

  async addVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const file = fileFromRequest(req);
      if (!file) {
        return res.status(400).json({ error: { code: "NO_FILE", message: "No file was uploaded." } });
      }
      const document = await documentsService.addVersion(req.params.id, file, req.user!, req.body?.changeNote);
      return res.status(201).json({ data: document });
    } catch (err) {
      return next(err);
    }
  },

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentsService.softDelete(req.params.id);
      res.status(200).json({ data: document });
    } catch (err) {
      next(err);
    }
  },

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await documentsService.restore(req.params.id);
      res.status(200).json({ data: document });
    } catch (err) {
      next(err);
    }
  },

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await documentsService.addComment(req.params.id, req.user!, req.body.body);
      res.status(201).json({ data: comment });
    } catch (err) {
      next(err);
    }
  },
};
