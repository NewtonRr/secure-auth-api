import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { prisma } from '../../shared/prisma.js';
import { Errors } from '../../shared/errors.js';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, async (_req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: res.locals.userId },
    select: { id: true, email: true, createdAt: true },
  });
  if (!user) throw Errors.invalidToken();
  res.json(user);
});
