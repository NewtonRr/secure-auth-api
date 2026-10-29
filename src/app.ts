import express from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { errorHandler } from './middlewares/error-handler.js';
import { globalLimiter } from './middlewares/rate-limiter.js';
import { env } from './config/env.js';

export const app = express();

app.disable('x-powered-by');
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));

app.set('trust proxy', env.TRUST_PROXY);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use(usersRouter);
app.use(errorHandler); // tem que ficar em ULTIMO!!!!
