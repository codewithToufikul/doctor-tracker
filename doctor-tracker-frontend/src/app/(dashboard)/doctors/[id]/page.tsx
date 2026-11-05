"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  UserMinus,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useDoctor, useDoctorPatients, useDeleteDoctor, useRemovePatientFromDoctor, useDeletePatientFromDoctor } from "@/hooks/useDoctors";
import { useDebounce } from "@/hooks/useDebounce";
import DoctorFormModal from "@/components/doctors/DoctorFormModal";
import AddPatientToDoctorModal from "@/components/doctors/AddPatientToDoctorModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTablePagination from "@/components/common/DataTablePagination";
import TableSkeleton from "@/components/common/TableSkeleton";
import EmptyState from "@/components/common/EmptyState";
import { formatDate, getInitials } from "@/lib/utils";
import type { Doctor, Patient } from "@/types";

  const STATUS_STYLES: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    "Under Treatment": "bg-amber-50 text-amber-700",
    Critical: "bg-rose-50 text-rose-700",
    Discharged: "bg-slate-100 text-slate-600",
  };

  interface PageProps {
    params: Promise<{ id: string }>;
  }

  export default function DoctorDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [editOpen, setEditOpen] = useState(false);
    const [addPatientOpen, setAddPatientOpen] = useState(false);
    const [deletingDoctor, setDeletingDoctor] = useState(false);
    const [unassigningPatient, setUnassigningPatient] = useState<Patient | undefined>();
    const [deletingPatient, setDeletingPatient] = useState<Patient | undefined>();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    const { data: doctor, isLoading: doctorLoading } = useDoctor(id);
    const { data: patientsData, isLoading: patientsLoading } = useDoctorPatients(id, {
      page,
      limit,
      search: debouncedSearch || undefined,
    });

    const deleteDoctor = useDeleteDoctor();
    const removePatient = useRemovePatientFromDoctor();
    const deletePatient = useDeletePatientFromDoctor();

    const handleDeleteDoctor = async () => {
      if (!doctor) return;
      try {
        await deleteDoctor.mutateAsync(doctor._id);
        toast.success(`Dr. ${doctor.name} removed from the system`);
        router.push("/doctors");
      } catch {
        toast.error("Failed to delete doctor");
      }
    };

    const handleUnassign = async () => {
      if (!unassigningPatient) return;
      try {
        await removePatient.mutateAsync({ doctorId: id, patientId: unassigningPatient._id });
        toast.success(`${unassigningPatient.name} unassigned from Dr. ${doctor?.name}`);
        setUnassigningPatient(undefined);
      } catch {
        toast.error("Failed to unassign patient");
      }
    };

    const handleDeletePatient = async () => {
      if (!deletingPatient) return;
      try {
        await deletePatient.mutateAsync({ doctorId: id, patientId: deletingPatient._id });
        toast.success(`${deletingPatient.name}'s record deleted`);
        setDeletingPatient(undefined);
      } catch {
        toast.error("Failed to delete patient");
      }
    };

    if (doctorLoading) {
      return (
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
        </div>
      );
    }

    if (!doctor) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-sm">Doctor not found.</p>
          <button onClick={() => router.push("/doctors")} className="mt-3 text-sm text-blue-600 hover:underline">
            Back to directory
          </button>
        </div>
      );
    }

    return (
            <div>
              <button
                onClick={() => router.push("/doctors")}
                className="mb-5 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Doctors
              </button>

              {/* Doctor Profile Card */}
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                      {getInitials(doctor.name)}
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-slate-900">{doctor.name}</h1>
                      <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {doctor.specialization}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingDoctor(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 md:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {doctor.hospital}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {doctor.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Joined {formatDate(doctor.createdAt)}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Users className="h-4 w-4" />
                  <span>
                    <strong className="text-slate-900">{doctor.patientCount ?? 0}</strong> assigned patient{(doctor.patientCount ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

                {/* Assigned Patients Table */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">Assigned Patients</h2>
                    <div className="flex items-center gap-3">
                      <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search patients..."
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setAddPatientOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Add Patient
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Patient</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Condition</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Admission</th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {patientsLoading ? (
                          <TableSkeleton cols={5} rows={5} />
                        ) : !patientsData?.patients || patientsData.patients.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <EmptyState
                                icon={Users}
                                title="No assigned patients"
                                description="Add a patient to this doctor to get started."
                                action={{ label: "Add Patient", onClick: () => setAddPatientOpen(true) }}
                              />
                            </td>
                          </tr>
                        ) : (
                          patientsData.patients.map((patient) => (
                            <tr key={patient._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">{patient.name}</div>
                                <div className="text-xs text-slate-400">{patient.age}y · {patient.gender}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{patient.condition}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[patient.status] ?? "bg-slate-100 text-slate-600"}`}>
                                  {patient.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{formatDate(patient.admissionDate)}</td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => setUnassigningPatient(patient)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                    title="Unassign from doctor"
                                  >
                                    <UserMinus className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingPatient(patient)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    title="Delete patient record"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {patientsData?.pagination && patientsData.pagination.totalRecords > 0 && (
                    <DataTablePagination
                      pagination={patientsData.pagination}
                      limit={limit}
                      onPageChange={setPage}
                      onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    />
                  )}
                </div>

                <DoctorFormModal isOpen={editOpen} onClose={() => setEditOpen(false)} doctor={doctor} />

                <AddPatientToDoctorModal
                  isOpen={addPatientOpen}
                  onClose={() => setAddPatientOpen(false)}
                  doctor={doctor as Doctor}
                />

                <ConfirmDialog
                  isOpen={deletingDoctor}
                  onClose={() => setDeletingDoctor(false)}
                  onConfirm={handleDeleteDoctor}
                  title="Delete Doctor"
                  description={`Remove Dr. ${doctor.name} from the system? Their ${doctor.patientCount ?? 0} patient(s) will be unassigned but records preserved.`}
                  confirmLabel="Delete Doctor"
                  isLoading={deleteDoctor.isPending}
                />

                <ConfirmDialog
                  isOpen={!!unassigningPatient}
                  onClose={() => setUnassigningPatient(undefined)}
                  onConfirm={handleUnassign}
                  title="Unassign Patient"
                  description={`Remove ${unassigningPatient?.name} from Dr. ${doctor.name}? The patient record will be preserved as unassigned.`}
                  confirmLabel="Unassign"
                  isLoading={removePatient.isPending}
                  variant="warning"
                />

                <ConfirmDialog
                  isOpen={!!deletingPatient}
                  onClose={() => setDeletingPatient(undefined)}
                  onConfirm={handleDeletePatient}
                  title="Delete Patient Record"
                  description={`Permanently delete ${deletingPatient?.name}'s clinical record? This action cannot be undone.`}
                  confirmLabel="Delete Record"
                  isLoading={deletePatient.isPending}
                />
              </div>
              );
}
