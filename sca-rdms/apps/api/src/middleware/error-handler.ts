import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../lib/logger";
import { env } from "../config/env";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}

/**
 * Centralized error handler. Never leaks stack traces or internal details
 * in production responses; always logs full detail server-side.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId;

  if (err instanceof ZodError) {
    logger.warn({ requestId, issues: err.issues }, "validation error");
    return res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "One or more fields are invalid.",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error({ requestId, code: err.code, meta: err.meta }, "database error");
    if (err.code === "P2002") {
      return res.status(409).json({
        error: { code: "DUPLICATE_ENTRY", message: "A record with this value already exists." },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Record not found." } });
    }
    return res.status(500).json({ error: { code: "DATABASE_ERROR", message: "A database error occurred." } });
  }

  if (err instanceof AppError) {
    logger.warn({ requestId, statusCode: err.statusCode, message: err.message }, "operational error");
    return res.status(err.statusCode).json({ error: { code: "APP_ERROR", message: err.message } });
  }

  logger.error({ requestId, err }, "unhandled error");
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Something went wrong." : (err as Error)?.message,
    },
  });
}
