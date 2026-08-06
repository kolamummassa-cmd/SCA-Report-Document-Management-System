import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import { validateBody } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  requestEmailVerificationSchema,
} from "./auth.validation";
import { env } from "../../config/env";

export const authRouter = Router();

// Tighter limit than the global API limiter (per SRS FR: rate limiting on
// auth endpoints) — brute-forcing credentials should be expensive.
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/login", authLimiter, validateBody(loginSchema), authController.login);
authRouter.post("/refresh", authLimiter, authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", authLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
authRouter.post(
  "/request-email-verification",
  authLimiter,
  validateBody(requestEmailVerificationSchema),
  authController.requestEmailVerification
);
authRouter.post("/verify-email", authLimiter, validateBody(verifyEmailSchema), authController.verifyEmail);
authRouter.get("/me", authenticate, authController.me);
