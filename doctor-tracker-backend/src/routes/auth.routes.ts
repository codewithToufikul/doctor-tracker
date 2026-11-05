import { Router } from 'express';
import { login, getMe, logout } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { loginSchema } from '../validations/auth.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', validateRequest(loginSchema), login);
authRouter.get('/me', authenticate, getMe);
authRouter.post('/logout', logout);

