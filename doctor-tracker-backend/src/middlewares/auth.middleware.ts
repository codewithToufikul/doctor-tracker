import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/AppError.js';
import { Admin } from '../models/admin.model.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. No session token provided.');
    }

    const decoded = verifyToken(token);
    const admin = await Admin.findById(decoded.id).select('_id name email role');

    if (!admin) {
      throw new UnauthorizedError('Authenticated account no longer exists.');
    }

    req.user = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

