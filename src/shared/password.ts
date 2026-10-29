// import
import argon2 from 'argon2';

// hash e verificacao de senhas
export const hashPassword = (plain: string) => argon2.hash(plain, { type: argon2.argon2id });
export const verifyPassword = (hash: string, plain: string) => argon2.verify(hash, plain);
