import { Router } from 'express';
import {
  getOverview,
  getPatientsPerDoctor,
  getAdmissionTrends,
  getConditionDistribution,
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  trendsQuerySchema,
  patientsPerDoctorQuerySchema,
} from '../validations/analytics.validation.js';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get('/overview', getOverview);
analyticsRouter.get(
  '/patients-per-doctor',
  validateRequest(patientsPerDoctorQuerySchema),
  getPatientsPerDoctor
);
analyticsRouter.get('/trends', validateRequest(trendsQuerySchema), getAdmissionTrends);
analyticsRouter.get('/conditions-distribution', getConditionDistribution);
