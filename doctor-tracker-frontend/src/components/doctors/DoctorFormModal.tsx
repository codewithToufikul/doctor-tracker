"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createDoctorSchema, SPECIALIZATIONS, type CreateDoctorInput } from "@/validations/doctor.schema";
import { useCreateDoctor, useUpdateDoctor } from "@/hooks/useDoctors";
import type { Doctor } from "@/types";

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: Doctor;
}

export default function DoctorFormModal({ isOpen, onClose, doctor }: DoctorFormModalProps) {
  const isEditing = !!doctor;
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        doctor
          ? {
            name: doctor.name,
            specialization: doctor.specialization as CreateDoctorInput["specialization"],
            hospital: doctor.hospital,
            phone: doctor.phone,
            email: doctor.email,
          }
          : { name: "", specialization: undefined, hospital: "", phone: "", email: "" }
      );
    }
  }, [isOpen, doctor, reset]);

  const isPending = createDoctor.isPending || updateDoctor.isPending;

  const onSubmit = async (values: CreateDoctorInput) => {
    try {
      if (isEditing) {
        await updateDoctor.mutateAsync({ id: doctor._id, payload: values });
        toast.success("Doctor updated successfully");
      } else {
        await createDoctor.mutateAsync(values);
        toast.success("Doctor registered successfully");
      }
      onClose();
    } catch {
      toast.error(isEditing ? "Failed to update doctor" : "Failed to register doctor");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEditing ? "Edit Doctor" : "Register Doctor"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? "Update practitioner information" : "Add a new medical practitioner"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                {...register("name")}
                placeholder="Dr. John Smith"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Specialization</label>
              <select
                {...register("specialization")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Hospital</label>
              <input
                {...register("hospital")}
                placeholder="City Medical Center"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.hospital && <p className="mt-1 text-xs text-red-500">{errors.hospital.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input
                {...register("phone")}
                placeholder="+1 234 567 8900"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="doctor@hospital.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Register Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
