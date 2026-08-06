import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

/**
 * Validates `req.body` against a Zod schema shared with the frontend
 * (see packages/shared-schemas). On success, replaces `req.body` with the
 * parsed (and type-coerced) result. On failure, forwards the ZodError to
 * the global error handler, which formats a 422 response.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
