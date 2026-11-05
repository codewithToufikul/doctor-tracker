"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDoctorSchema,
  SPECIALIZATIONS,
  type CreateDoctorInput,
} from "@/validations/doctor.schema";
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
      toast.success("Doctor profile updated");
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Modal / Bottom Sheet */}
          <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Mobile handle indicator */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4">
              <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {isEditing ? "Edit Doctor" : "Register Doctor"}
                  </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      {isEditing ? "Update practitioner details" : "Register a new medical specialist"}
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
                            placeholder="Dr. John Smith"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Specialization <span className="text-rose-500">*</span>
                          </label>
                          <select
                            {...register("specialization")}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select specialty</option>
                            {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                            ))}
                          </select>
                          {errors.specialization && (
                            <p className="mt-1 text-xs text-rose-500">{errors.specialization.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Hospital <span className="text-rose-500">*</span>
                          </label>
                          <input
                            {...register("hospital")}
                            placeholder="City General Hospital"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {errors.hospital && (
                            <p className="mt-1 text-xs text-rose-500">{errors.hospital.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            {...register("phone")}
                            placeholder="+1 234 567 8900"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            {...register("email")}
                            type="email"
                            placeholder="doctor@hospital.com"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
                          )}
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
                            <span>{isEditing ? "Save Changes" : "Register Doctor"}</span>
                          </button>
                        </div>
                    </form>
                  </div>
                </div>
                );
}
