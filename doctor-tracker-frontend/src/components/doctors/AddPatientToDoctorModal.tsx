"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPatientSchema, CONDITIONS, PATIENT_STATUSES, type CreatePatientInput } from "@/validations/patient.schema";
import { useAddPatientToDoctor } from "@/hooks/useDoctors";
import type { Doctor } from "@/types";

interface AddPatientToDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
}

export default function AddPatientToDoctorModal({ isOpen, onClose, doctor }: AddPatientToDoctorModalProps) {
  const addPatient = useAddPatientToDoctor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: { status: "Active", gender: "Male" },
  });

  useEffect(() => {
    if (isOpen) reset({ status: "Active", gender: "Male" });
  }, [isOpen, reset]);

  const onSubmit = async (values: CreatePatientInput) => {
    const payload = {
      ...values,
      email: values.email || undefined,
      medicalNotes: values.medicalNotes || undefined,
      admissionDate: values.admissionDate || undefined,
    };
    try {
      await addPatient.mutateAsync({ doctorId: doctor._id, payload });
      toast.success(`Patient added to Dr. ${doctor.name}`);
      onClose();
    } catch {
      toast.error("Failed to add patient");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add Patient</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned to Dr. {doctor.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input {...register("name")} placeholder="Patient full name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
              <input {...register("age")} type="number" min={0} max={150} placeholder="35" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select {...register("gender")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input {...register("phone")} placeholder="+1 234 567 8900" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email <span className="text-slate-400">(optional)</span></label>
              <input {...register("email")} type="email" placeholder="patient@email.com" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Condition</label>
              <select {...register("condition")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.condition && <p className="mt-1 text-xs text-red-500">{errors.condition.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select {...register("status")} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {PATIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Admission Date <span className="text-slate-400">(optional)</span></label>
              <input {...register("admissionDate")} type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Medical Notes <span className="text-slate-400">(optional)</span></label>
              <textarea {...register("medicalNotes")} rows={3} placeholder="Clinical notes, observations..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={addPatient.isPending} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {addPatient.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

