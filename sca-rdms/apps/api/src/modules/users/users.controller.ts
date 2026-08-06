import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";

/**
 * Minimal read-only endpoint — exists in Phase 3 purely to prove the RBAC
 * middleware chain works end to end (authenticate + authorize("user","read")).
 * The full Users CRUD module (create/deactivate/reset access, per the
 * Development Roadmap's Phase 10 Admin Console) lands later.
 */
export const usersController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          isEmailVerified: true,
          role: { select: { name: true } },
          department: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      });
      res.status(200).json({ data: users });
    } catch (err) {
      next(err);
    }
  },
};
