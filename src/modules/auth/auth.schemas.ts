// imports
import { z } from 'zod';

// formatacao
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const password = z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/);

// schemas
export const registerSchema = z.object({ email, password });
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export const refreshSchema = z.object({ refreshToken: z.string().min(1).max(200) });
