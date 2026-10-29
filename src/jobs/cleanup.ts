import { prisma } from '../shared/prisma.js';

const RETENTION_DAYS = 30;
const INTERVAL_MS = 24 * 60 * 60 * 1000;

async function cleanupRefreshTokens() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
  const { count } = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: cutoff } },
  });
  console.log(`[cleanup] deleted ${count} expired refresh tokens`);
}

export function startCleanupJob() {
  const run = () => cleanupRefreshTokens().catch((err) => console.error('[cleanup] failed', err));

  run();
  setInterval(run, INTERVAL_MS).unref();
}
