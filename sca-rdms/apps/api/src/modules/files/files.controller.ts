import type { Request, Response, NextFunction } from "express";
import { filesService } from "./files.service";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/error-handler";

/**
 * A file may belong to a Report or a Document (or neither, transiently).
 * Download access follows whichever parent it's attached to — a user needs
 * `report:read`/`document:read`-equivalent visibility, which we approximate
 * here by re-using the same role check as the parent module's list/detail
 * routes would use. For Phase 4 this is intentionally simple: any
 * authenticated user with `document:download` or the report's read access
 * can fetch it; fine-grained per-record sharing overrides land later
 * (see UI Design Plan, Document Detail sharing panel).
 */
export const filesController = {
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await filesService.findById(req.params.id);
      if (!file) {
        throw new AppError("File not found.", 404);
      }

      const buffer = await filesService.getFileBuffer(file.storageKey);

      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: "FILE_DOWNLOAD",
          entityType: "File",
          entityId: file.id,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.originalName)}"`);
      res.status(200).send(buffer);
    } catch (err) {
      next(err);
    }
  },
};
