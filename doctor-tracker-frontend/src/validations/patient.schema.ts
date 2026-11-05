import { z } from "zod";

const CONDITIONS = [
  "Cardiovascular",
  "Hypertension",
  "Diabetes",
  "Orthopedic",
  "Respiratory",
  "Neurological",
  "Oncology",
  "Pediatric",
  "General Checkup",
  "Other",
] as const;

const PATIENT_STATUSES = ["Active", "Under Treatment", "Critical", "Discharged"] as const;

export const createPatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().int().min(0).max(150),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  condition: z.enum(CONDITIONS, { required_error: "Condition is required" }),
  status: z.enum(PATIENT_STATUSES).default("Active"),
  doctorId: z.string().optional().or(z.literal("")),
  admissionDate: z.string().optional(),
  medicalNotes: z.string().max(1000).optional().or(z.literal("")),
});

export const updatePatientSchema = createPatientSchema.partial();

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export { CONDITIONS, PATIENT_STATUSES };

