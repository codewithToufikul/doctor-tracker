import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patient.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  createPatientSchema,
  updatePatientSchema,
  patientQuerySchema,
} from '../validations/patient.validation.js';

export const patientRouter = Router();

patientRouter.use(authenticate);

patientRouter.get('/', validateRequest(patientQuerySchema), getPatients);
patientRouter.post('/', validateRequest(createPatientSchema), createPatient);
patientRouter.get('/:id', getPatientById);
patientRouter.put('/:id', validateRequest(updatePatientSchema), updatePatient);
patientRouter.delete('/:id', deletePatient);
