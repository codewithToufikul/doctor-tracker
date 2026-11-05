import { Schema, model, Document, Types } from 'mongoose';

export type PatientStatus = 'Active' | 'Under Treatment' | 'Critical' | 'Discharged';
export type PatientGender = 'male' | 'female' | 'other';

export interface IPatientDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  condition: string;
  status: PatientStatus;
  doctorId: Types.ObjectId | null;
  admissionDate: Date;
  medicalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatientDocument>(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Age must be realistic'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Medical condition is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Clinical status is required'],
      enum: ['Active', 'Under Treatment', 'Critical', 'Discharged'],
      default: 'Active',
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
      index: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    medicalNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Medical notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1, createdAt: -1 });
patientSchema.index({ status: 1, createdAt: -1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ name: 1, phone: 1 });

export const Patient = model<IPatientDocument>('Patient', patientSchema);

