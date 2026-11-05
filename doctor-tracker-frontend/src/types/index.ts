export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  active: boolean;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PatientStatus = 'Active' | 'Under Treatment' | 'Critical' | 'Discharged';
export type PatientGender = 'Male' | 'Female' | 'Other';

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  condition: string;
  status: PatientStatus;
  doctorId?: string | null;
  doctor?: {
    _id: string;
    name: string;
    specialization: string;
    hospital?: string;
    email?: string;
  } | null;
  admissionDate: string;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: Record<string, string>;
}

export interface DashboardOverview {
  totalDoctors: number;
  totalPatients: number;
  unassignedPatients: number;
  averagePatientsPerDoctor: number;
  activePatientsCount: number;
  criticalPatientsCount: number;
  underTreatmentCount: number;
  dischargedCount: number;
}

export interface PatientsPerDoctor {
  doctorId: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  patientCount: number;
}

export interface AdmissionTrend {
  date: string;
  admissions: number;
}

export interface ConditionDistribution {
  condition: string;
  count: number;
  percentage: number;
}

/** @deprecated Use PatientsPerDoctor */
export type DoctorPatientLoad = PatientsPerDoctor;
/** @deprecated Use AdmissionTrend */
export type AdmissionTrendPoint = AdmissionTrend;
/** @deprecated Use ConditionDistribution */
export type ConditionDistributionItem = ConditionDistribution;

