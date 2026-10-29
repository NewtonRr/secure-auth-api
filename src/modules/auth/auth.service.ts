import { randomUUID } from 'node:crypto';
import { prisma } from '../../shared/prisma.js';
import { hashPassword, verifyPassword } from '../../shared/password.js';
import { signAccessToken, generateRefreshToken, hashToken } from '../../shared/tokens.js';
import { Errors } from '../../shared/errors.js';

const REFRESH_DAYS = 7;
const DUMMY_HASH = await hashPassword('dummy-password-for-timing');

async function issueRefreshToken(
  userId: string,
  familyId: string,
  ip?: string,
  userAgent?: string,
) {
  const token = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId,
      familyId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 86_400_000),
      ip,
      userAgent,
    },
  });
  return token;
}

export async function register(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  return { id: user.id, email: user.email };
}

export async function login(email: string, password: string, ip?: string, userAgent?: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await verifyPassword(user?.passwordHash ?? DUMMY_HASH, password);
  if (!user || !valid) throw Errors.invalidCredentials();

  const refreshToken = await issueRefreshToken(user.id, randomUUID(), ip, userAgent);
  return { accessToken: signAccessToken(user.id), refreshToken };
}

export async function refresh(token: string, ip?: string, userAgent?: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!stored || stored.expiresAt < new Date()) throw Errors.invalidToken();

  const claimed = await prisma.refreshToken.updateMany({
    where: { id: stored.id, usedAt: null, revokedAt: null },
    data: { usedAt: new Date() },
  });

  if (claimed.count === 0) {
    await prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw Errors.invalidToken();
  }

  const refreshToken = await issueRefreshToken(stored.userId, stored.familyId, ip, userAgent);
  return { accessToken: signAccessToken(stored.userId), refreshToken };
}

export async function logout(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!stored) return;
  await prisma.refreshToken.updateMany({
    where: { familyId: stored.familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
