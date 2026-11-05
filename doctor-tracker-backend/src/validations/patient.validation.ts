import { z } from 'zod';

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createPatientSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Patient name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    age: z.coerce
      .number({ required_error: 'Age is required' })
      .int('Age must be an integer')
      .min(0, 'Age cannot be negative')
      .max(130, 'Age must be realistic'),
    gender: z.enum(['male', 'female', 'other'], {
      required_error: 'Gender is required',
    }),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .regex(phoneRegex, 'Invalid phone number format'),
    email: z
      .string()
      .trim()
      .email('Please provide a valid email address')
      .optional()
      .or(z.literal('')),
    condition: z
      .string({ required_error: 'Medical condition is required' })
      .trim()
      .min(2, 'Condition must be at least 2 characters')
      .max(100, 'Condition cannot exceed 100 characters'),
    status: z.enum(['Active', 'Under Treatment', 'Critical', 'Discharged'], {
      required_error: 'Clinical status is required',
    }),
    doctorId: z
      .string()
      .regex(objectIdRegex, 'Invalid doctor ID format')
      .nullable()
      .optional(),
    admissionDate: z.string().optional(),
    medicalNotes: z.string().trim().max(1000).optional(),
  }),
});

export const updatePatientSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      age: z.coerce.number().int().min(0).max(130).optional(),
      gender: z.enum(['male', 'female', 'other']).optional(),
      phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format').optional(),
      email: z.string().trim().email('Please provide a valid email address').optional().or(z.literal('')),
      condition: z.string().trim().min(2).max(100).optional(),
      status: z.enum(['Active', 'Under Treatment', 'Critical', 'Discharged']).optional(),
      doctorId: z.string().regex(objectIdRegex, 'Invalid doctor ID format').nullable().optional(),
      admissionDate: z.string().optional(),
      medicalNotes: z.string().trim().max(1000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const patientQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    condition: z.string().trim().optional(),
    status: z.enum(['Active', 'Under Treatment', 'Critical', 'Discharged']).optional(),
    doctorId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['name', 'admissionDate', 'age', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>['body'];
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>['body'];
