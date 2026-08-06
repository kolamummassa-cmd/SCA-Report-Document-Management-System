import bcrypt from "bcryptjs";
import { authRepository } from "./auth.repository";
import { env } from "../../config/env";
import { signAccessToken, signPurposeToken, verifyPurposeToken } from "../../lib/jwt";
import { generateRefreshToken, hashToken } from "../../lib/tokens";
import { sendPasswordResetEmail, sendEmailVerificationEmail } from "../../lib/mailer";
import { AppError } from "../../middleware/error-handler";
import { logger } from "../../lib/logger";

const BCRYPT_COST = 12;

function refreshExpiryDate(): Date {
  // JWT_REFRESH_EXPIRES_IN is a "30d"-style string; keep this simple and
  // configurable via a dedicated day count rather than parsing the string.
  const days = 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function lockoutExpiryDate(): Date {
  return new Date(Date.now() + env.ACCOUNT_LOCKOUT_WINDOW_MINUTES * 60 * 1000);
}

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export const authService = {
  async login(email: string, password: string, ctx: RequestContext) {
    const user = await authRepository.findUserByEmail(email);

    // Constant-ish response regardless of whether the account exists, to
    // avoid confirming valid emails to an attacker.
    const genericError = () => new AppError("Invalid email or password.", 401);

    if (!user || !user.isActive) {
      throw genericError();
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(
        `Account temporarily locked due to repeated failed sign-in attempts. Try again after ${user.lockedUntil.toLocaleTimeString()}.`,
        423
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil = attempts >= env.ACCOUNT_LOCKOUT_MAX_ATTEMPTS ? lockoutExpiryDate() : null;
      await authRepository.recordFailedLogin(user.id, attempts, lockedUntil);
      await authRepository.writeAuditLog({
        userId: user.id,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: user.id,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      throw genericError();
    }

    if (!user.isEmailVerified) {
      throw new AppError("Please verify your email address before signing in.", 403);
    }

    await authRepository.recordSuccessfulLogin(user.id);

    const accessToken = signAccessToken({ sub: user.id, roleId: user.roleId, email: user.email });
    const refreshToken = generateRefreshToken();
    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      deviceInfo: ctx.userAgent,
      ipAddress: ctx.ipAddress,
      expiresAt: refreshExpiryDate(),
    });

    await authRepository.writeAuditLog({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleId: user.roleId,
      },
    };
  },

  async refresh(presentedRefreshToken: string, ctx: RequestContext) {
    const hash = hashToken(presentedRefreshToken);
    const session = await authRepository.findActiveSessionByHash(hash);
    if (!session) {
      throw new AppError("Session expired or already logged out. Please sign in again.", 401);
    }

    const user = await authRepository.findUserById(session.userId);
    if (!user || !user.isActive) {
      throw new AppError("Account no longer active.", 401);
    }

    // Rotate: revoke the presented refresh token and issue a new one, so a
    // stolen-but-unused token can't be replayed after a legitimate refresh.
    await authRepository.revokeSession(session.id);

    const accessToken = signAccessToken({ sub: user.id, roleId: user.roleId, email: user.email });
    const newRefreshToken = generateRefreshToken();
    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashToken(newRefreshToken),
      deviceInfo: ctx.userAgent,
      ipAddress: ctx.ipAddress,
      expiresAt: refreshExpiryDate(),
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(presentedRefreshToken: string | undefined, userId?: string) {
    if (presentedRefreshToken) {
      const session = await authRepository.findActiveSessionByHash(hashToken(presentedRefreshToken));
      if (session) {
        await authRepository.revokeSession(session.id);
      }
    }
    if (userId) {
      await authRepository.writeAuditLog({ userId, action: "LOGOUT", entityType: "User", entityId: userId });
    }
  },

  async forgotPassword(email: string, appBaseUrl: string) {
    const user = await authRepository.findUserByEmail(email);
    // Always behave the same way whether or not the account exists.
    if (user) {
      const token = signPurposeToken({ sub: user.id, purpose: "password_reset" }, env.PASSWORD_RESET_TOKEN_EXPIRES_IN);
      const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, resetUrl);
      logger.info({ userId: user.id }, "Password reset email queued");
    }
  },

  async resetPassword(token: string, newPassword: string) {
    let payload;
    try {
      payload = verifyPurposeToken(token, "password_reset");
    } catch {
      throw new AppError("This password reset link is invalid or has expired.", 400);
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw new AppError("This password reset link is invalid or has expired.", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
    await authRepository.updatePassword(user.id, passwordHash);
    // Invalidate every existing session — a password reset should log out
    // any device an attacker (or the user, from a lost laptop) was using.
    await authRepository.revokeAllSessionsForUser(user.id);
    await authRepository.writeAuditLog({ userId: user.id, action: "PASSWORD_RESET", entityType: "User", entityId: user.id });
  },

  async requestEmailVerification(email: string, appBaseUrl: string) {
    const user = await authRepository.findUserByEmail(email);
    if (user && !user.isEmailVerified) {
      const token = signPurposeToken({ sub: user.id, purpose: "email_verification" }, env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN);
      const verifyUrl = `${appBaseUrl}/verify-email?token=${token}`;
      await sendEmailVerificationEmail(user.email, verifyUrl);
    }
  },

  async verifyEmail(token: string) {
    let payload;
    try {
      payload = verifyPurposeToken(token, "email_verification");
    } catch {
      throw new AppError("This verification link is invalid or has expired.", 400);
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw new AppError("This verification link is invalid or has expired.", 400);
    }

    await authRepository.markEmailVerified(user.id);
    await authRepository.writeAuditLog({ userId: user.id, action: "EMAIL_VERIFIED", entityType: "User", entityId: user.id });
  },
};
