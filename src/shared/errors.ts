export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export const Errors = {
  invalidCredentials: () => new AppError(401, 'INVALID_CREDENTIALS', 'invalid email or password'),
  invalidToken: () => new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'),
  emailTaken: () => new AppError(409, 'EMAIL_TAKEN', 'Email already registered'),
};
