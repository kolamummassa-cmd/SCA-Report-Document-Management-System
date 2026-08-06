/**
 * Data access for the auth module. Keeping Prisma calls behind a repository
 * layer (rather than calling `prisma` directly in the service) means the
 * service's business logic can be unit-tested against a mocked repository.
 */

import { prisma } from "../../lib/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  recordFailedLogin(userId: string, attempts: number, lockedUntil: Date | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: attempts, lockedUntil },
    });
  },

  recordSuccessfulLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  markEmailVerified(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true } });
  },

  createSession(data: {
    userId: string;
    refreshTokenHash: string;
    deviceInfo?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({ data });
  },

  findActiveSessionByHash(refreshTokenHash: string) {
    return prisma.session.findFirst({
      where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  revokeSession(id: string) {
    return prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  revokeAllSessionsForUser(userId: string) {
    return prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  writeAuditLog(entry: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    return prisma.auditLog.create({ data: entry });
  },
};
