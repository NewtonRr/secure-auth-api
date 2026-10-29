import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Errors } from '../shared/errors.js';

export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) throw Errors.invalidToken();

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !payload.sub) throw new Error('bad payload');
    res.locals.userId = payload.sub;
    next();
  } catch {
    throw Errors.invalidToken();
  }
};
