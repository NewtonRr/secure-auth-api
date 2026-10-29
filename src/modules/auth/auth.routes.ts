import { Router } from 'express';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import {
  loginAccountLimiter,
  loginIpLimiter,
  registerLimiter,
} from '../../middlewares/rate-limiter.js';
import * as service from './auth.service.js';

export const authRouter = Router();

authRouter.post('/register', registerLimiter, async (req, res) => {
  const { email, password } = registerSchema.parse(req.body);
  res.status(201).json(await service.register(email, password));
});

authRouter.post('/login', loginIpLimiter, loginAccountLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  res.json(await service.login(email, password, req.ip, req.get('user-agent')));
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  res.json(await service.refresh(refreshToken, req.ip, req.get('user-agent')));
});

authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  await service.logout(refreshToken);
  res.status(204).end();
});
