import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { IAdminPayload } from '../types/index.js';
import { UnauthorizedError } from './AppError.js';

export const signToken = (payload: IAdminPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): IAdminPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as IAdminPayload;
  } catch {
    throw new UnauthorizedError('Session expired or invalid. Please sign in again.');
  }
};

