import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import type { Request } from 'express';
import { redis } from '../shared/redis.js';

const store = (prefix: string) =>
  new RedisStore({
    prefix: `rl:${prefix}:`,
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>,
  });

const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: import('express').Response) => {
    res.status(429).json({ code: 'RATE_LIMITED', message: 'Too many requests, try again later' });
  },
} as const;

const ip = (req: Request) => ipKeyGenerator(req.ip ?? '');
const emailOf = (req: Request) =>
  typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'none';

export const globalLimiter = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 100,
  keyGenerator: ip,
  store: store('global'),
});

export const registerLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60_000,
  limit: 5,
  keyGenerator: ip,
  store: store('register'),
});

export const loginIpLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: ip,
  store: store('login-ip'),
});

export const loginAccountLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60_000,
  limit: 20,
  skipSuccessfulRequests: true,
  keyGenerator: emailOf,
  store: store('login-acct'),
});
