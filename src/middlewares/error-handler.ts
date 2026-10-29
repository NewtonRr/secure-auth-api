import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, Errors } from '../shared/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ code: err.code, message: err.message });
  }
  if (err?.code === 'P2002') {
    const e = Errors.emailTaken();
    return res.status(e.status).json({ code: e.code, message: e.message });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ code: 'PAYLOAD_TOO_LARGE', message: 'body too large' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ code: 'INVALID_JSON', message: 'Malformed JSON' });
  }

  console.error(err);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something Went Wrong' });
};
