import { z } from 'zod';

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const createDoctorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Doctor name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    specialization: z
      .string({ required_error: 'Specialization is required' })
      .trim()
      .min(2, 'Specialization must be at least 2 characters')
      .max(100, 'Specialization cannot exceed 100 characters'),
    hospital: z
      .string({ required_error: 'Hospital is required' })
      .trim()
      .min(2, 'Hospital must be at least 2 characters')
      .max(120, 'Hospital cannot exceed 120 characters'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .regex(phoneRegex, 'Invalid phone number format'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please provide a valid email address'),
  }),
});

export const updateDoctorSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      specialization: z.string().trim().min(2).max(100).optional(),
      hospital: z.string().trim().min(2).max(120).optional(),
      phone: z.string().trim().regex(phoneRegex, 'Invalid phone number format').optional(),
      email: z.string().trim().email('Please provide a valid email address').optional(),
      active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const doctorQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    specialization: z.string().trim().optional(),
    hospital: z.string().trim().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['name', 'specialization', 'hospital', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>['body'];
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>['body'];
