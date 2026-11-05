"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPatientSchema,
  CONDITIONS,
  PATIENT_STATUSES,
  type CreatePatientInput,
} from "@/validations/patient.schema";
import { useCreatePatient, useUpdatePatient } from "@/hooks/usePatients";
import { useAllDoctors } from "@/hooks/useDoctors";
import type { Patient } from "@/types";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  preselectedDoctorId?: string;
}

export default function PatientFormModal({
  isOpen,
  onClose,
  patient,
  preselectedDoctorId,
}: PatientFormModalProps) {
  const isEditing = !!patient;
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const { data: doctors } = useAllDoctors();

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
    if (isOpen) {
      reset(
        patient
          ? {
              name: patient.name,
              age: patient.age,
              gender: patient.gender as CreatePatientInput["gender"],
              phone: patient.phone,
              email: patient.email || "",
              condition: patient.condition as CreatePatientInput["condition"],
              status: patient.status as CreatePatientInput["status"],
              doctorId: patient.doctorId || "",
              admissionDate: patient.admissionDate ? patient.admissionDate.split("T")[0] : "",
              medicalNotes: patient.medicalNotes || "",
            }
          : {
              status: "Active",
              gender: "Male",
              doctorId: preselectedDoctorId || "",
            }
      );
    }
  }, [isOpen, patient, preselectedDoctorId, reset]);

  const isPending = createPatient.isPending || updatePatient.isPending;

  const onSubmit = async (values: CreatePatientInput) => {
    const payload = {
      ...values,
      email: values.email || undefined,
      medicalNotes: values.medicalNotes || undefined,
      admissionDate: values.admissionDate || undefined,
      doctorId: values.doctorId || null,
    };
    try {
      if (isEditing) {
        await updatePatient.mutateAsync({ id: patient._id, payload });
        toast.success("Patient record updated");
      } else {
        await createPatient.mutateAsync(payload);
        toast.success("Patient registered successfully");
      }
      onClose();
    } catch {
      toast.error(isEditing ? "Failed to update patient" : "Failed to register patient");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {isEditing ? "Edit Patient" : "Register Patient"}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {isEditing ? "Update clinical record" : "Record new patient admission"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Patient full name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("age")}
                type="number"
                min={0}
                max={150}
                placeholder="35"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.age && <p className="mt-1 text-xs text-rose-500">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("gender")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("phone")}
                placeholder="+1 234 567 8900"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="patient@email.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Condition <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("condition")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="mt-1 text-xs text-rose-500">{errors.condition.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Status <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("status")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PATIENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Doctor <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <select
                {...register("doctorId")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {doctors?.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.specialization} ({d.hospital})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Date <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                {...register("admissionDate")}
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                {...register("medicalNotes")}
                rows={3}
                placeholder="Observations, current medications, triage remarks..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Register Patient"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
