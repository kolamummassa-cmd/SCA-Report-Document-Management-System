import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { authRepository } from "./auth.repository";
import { env } from "../../config/env";

const REFRESH_COOKIE_NAME = "refreshToken";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/v1/auth",
  };
}

function requestContext(req: Request) {
  return { ipAddress: req.ip, userAgent: req.headers["user-agent"] };
}

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, requestContext(req));
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions());
      res.status(200).json({ data: { accessToken: result.accessToken, user: result.user } });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const presented = req.cookies?.[REFRESH_COOKIE_NAME];
      if (!presented) {
        return res.status(401).json({ error: { code: "NO_SESSION", message: "No active session." } });
      }
      const result = await authService.refresh(presented, requestContext(req));
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions());
      return res.status(200).json({ data: { accessToken: result.accessToken } });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const presented = req.cookies?.[REFRESH_COOKIE_NAME];
      await authService.logout(presented, req.user?.id);
      res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions());
      res.status(200).json({ data: { message: "Logged out." } });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email, env.APP_BASE_URL);
      // Always 200, regardless of whether the account exists.
      res.status(200).json({ data: { message: "If that email exists, a reset link has been sent." } });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);
      res.status(200).json({ data: { message: "Password updated. Please sign in again." } });
    } catch (err) {
      next(err);
    }
  },

  async requestEmailVerification(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.requestEmailVerification(req.body.email, env.APP_BASE_URL);
      res.status(200).json({ data: { message: "If that account needs verifying, an email has been sent." } });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.verifyEmail(req.body.token);
      res.status(200).json({ data: { message: "Email verified. You can now sign in." } });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authRepository.findUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found." } });
      }
      return res.status(200).json({
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleId: user.roleId,
          departmentId: user.departmentId,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
};
