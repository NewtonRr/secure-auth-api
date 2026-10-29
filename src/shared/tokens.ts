// imports
import jwt, { type SignOptions } from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

// Criacao do token de acesso a partir do userID, valores de tempo de vida alteraveis no .env
export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'],
  });

// criacao do token de refresh, string base64 randomica
export const generateRefreshToken = () => randomBytes(48).toString('base64url');
// criptografia do token em sha256
export const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');
