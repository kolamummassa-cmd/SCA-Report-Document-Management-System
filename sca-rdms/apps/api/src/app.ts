import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { env, corsAllowedOrigins } from "./config/env";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

// Feature route modules are added incrementally starting Phase 3
// (auth) and Phase 4 (reports, documents, files, search, ...).
// import { authRouter } from "./modules/auth/auth.routes";

export function createApp() {
  const app = express();

  // Trust the reverse proxy (Nginx/Cloudflare) for correct client IPs
  // in rate limiting and audit logging.
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
      crossOriginResourcePolicy: { policy: "same-site" },
    })
  );

  app.use(
    cors({
      origin: corsAllowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  app.use(requestLogger);

  const globalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", globalLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "sca-rdms-api", timestamp: new Date().toISOString() });
  });

  app.get("/api/v1", (_req, res) => {
    res.status(200).json({
      name: "SCA Report & Document Management System API",
      version: "v1",
      status: "Phase 2 — foundation only; feature routes land in Phase 3+",
    });
  });

  // Phase 3+: app.use("/api/v1/auth", authRouter); etc.

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
