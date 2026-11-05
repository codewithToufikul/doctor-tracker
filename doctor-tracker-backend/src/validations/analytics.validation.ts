import { z } from 'zod';

export const trendsQuerySchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional(),
  }),
});

export const patientsPerDoctorQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});
