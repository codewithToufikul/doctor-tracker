import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
  removePatientFromDoctor,
  deletePatientFromDoctor,
} from '../controllers/doctor.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorQuerySchema,
} from '../validations/doctor.validation.js';
import { createPatientSchema } from '../validations/patient.validation.js';

export const doctorRouter = Router();

doctorRouter.use(authenticate);

doctorRouter.get('/', validateRequest(doctorQuerySchema), getDoctors);
doctorRouter.post('/', validateRequest(createDoctorSchema), createDoctor);
doctorRouter.get('/:id', getDoctorById);
doctorRouter.put('/:id', validateRequest(updateDoctorSchema), updateDoctor);
doctorRouter.delete('/:id', deleteDoctor);

doctorRouter.get('/:id/patients', getDoctorPatients);
doctorRouter.post('/:id/patients', validateRequest(createPatientSchema), addPatientToDoctor);
doctorRouter.patch('/:id/patients/:patientId/remove', removePatientFromDoctor);
doctorRouter.delete('/:id/patients/:patientId', deletePatientFromDoctor);
