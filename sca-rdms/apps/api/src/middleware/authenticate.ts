import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { AppError } from "./error-handler";

/**
 * Verifies the Bearer access token and attaches `req.user`.
 * Does not touch the database — RBAC checks happen in `authorize`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required.", 401));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, roleId: payload.roleId, email: payload.email };
    next();
  } catch {
    next(new AppError("Invalid or expired access token.", 401));
  }
}
