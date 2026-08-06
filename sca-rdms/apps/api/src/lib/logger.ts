/**
 * Structured application logger (distinct from the AuditLog compliance
 * record — this is for operational debugging, not user-action history).
 */

import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
      : undefined,
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.passwordHash"],
});
