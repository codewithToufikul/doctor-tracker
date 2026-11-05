import { z } from "zod";

const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Oncology",
  "Dermatology",
  "General Surgery",
  "Pulmonology",
  "General",
] as const;

export const createDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialization: z.enum(SPECIALIZATIONS, { required_error: "Specialization is required" }),
  hospital: z.string().min(2, "Hospital name must be at least 2 characters"),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export { SPECIALIZATIONS };

