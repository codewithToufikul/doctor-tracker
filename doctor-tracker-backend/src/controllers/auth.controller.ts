import { Request, Response, NextFunction } from 'express';
import { Admin } from '../models/admin.model.js';
import { UnauthorizedError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { getAuthCookieOptions, getClearAuthCookieOptions } from '../utils/cookie.js';
import { LoginInput } from '../validations/auth.validation.js';

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    res.cookie('token', token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie('token', '', getClearAuthCookieOptions());
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

