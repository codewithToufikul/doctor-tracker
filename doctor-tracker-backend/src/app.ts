import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { NotFoundError } from './utils/AppError.js';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      const configuredFrontend = env.FRONTEND_URL?.replace(/\/+$/, '');
      
      const allowedPatterns = [
        configuredFrontend,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://doctortracker.dopain.tech',
      ];

      const isAllowed =
        allowedPatterns.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.dopain.tech') ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.endsWith('.netlify.app') ||
        normalizedOrigin.endsWith('.onrender.com');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(cookieParser());
app.use(express.json());

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/v1', apiRouter);

app.use('*', (req: Request) => {
  throw new NotFoundError(`Route ${req.originalUrl} does not exist`);
});

app.use(errorHandler);
