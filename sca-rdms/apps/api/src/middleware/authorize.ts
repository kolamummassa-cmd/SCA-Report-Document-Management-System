import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "./error-handler";

/**
 * RBAC permission check. Must run after `authenticate`.
 * Looks up whether the caller's role has been granted `resource:action`
 * via the role_permissions join table (see prisma/seed.ts for the
 * role -> permission matrix from the SRS).
 *
 * Super Admin is not special-cased here — it works because the seed script
 * grants SUPER_ADMIN every resource:action pair explicitly, which keeps the
 * permission model uniform and auditable (no hidden bypass in code).
 */
export function authorize(resource: string, action: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    const grant = await prisma.rolePermission.findFirst({
      where: {
        roleId: req.user.roleId,
        permission: { resource, action },
      },
    });

    if (!grant) {
      return next(
        new AppError(`You do not have permission to ${action} this ${resource}.`, 403)
      );
    }

    next();
  };
}
