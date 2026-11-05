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
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDoctor,
  useDoctorPatients,
  useDeleteDoctor,
  useRemovePatientFromDoctor,
  useDeletePatientFromDoctor,
} from "@/hooks/useDoctors";
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
  Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Under Treatment": "bg-amber-50 text-amber-700 border-amber-100",
  Critical: "bg-rose-50 text-rose-700 border-rose-100",
  Discharged: "bg-slate-100 text-slate-600 border-slate-200",
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
        <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-sm">Doctor record not found.</p>
          <button
            onClick={() => router.push("/doctors")}
            className="mt-3 text-sm text-blue-600 hover:underline font-medium"
          >
            Return to Doctors Directory
          </button>
      </div>
    );
  }

  return (
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={() => router.push("/doctors")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Doctors</span>
        </button>

        {/* Doctor Profile Card */}
                <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-13 w-13 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base sm:text-xl font-bold text-blue-700 shadow-2xs">
                        {getInitials(doctor.name)}
                      </div>
                      <div>
                        <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                          {doctor.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                            {doctor.specialization}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                            <strong>{doctor.patientCount ?? 0}</strong> patients
                          </span>
                        </div>
                      </div>
                    </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                        <button
                          onClick={() => setEditOpen(true)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingDoctor(true)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 active:scale-98 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                        {/* Info Grid */}
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate">{doctor.hospital}</span>
                          </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                              <a href={`tel:${doctor.phone}`} className="hover:text-blue-600 truncate font-medium">
                                {doctor.phone}
                              </a>
                            </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                <a href={`mailto:${doctor.email}`} className="truncate hover:text-blue-600">
                                  {doctor.email}
                                </a>
                              </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                  <span>Joined {formatDate(doctor.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                                  {/* Assigned Patients Section */}
                                  <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                      <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                          Assigned Patients
                                        </h2>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                          {patientsData?.pagination?.totalRecords ?? 0}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <div className="relative flex-1 sm:w-60">
                                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                          <input
                                            value={search}
                                            onChange={(e) => {
                                              setSearch(e.target.value);
                                              setPage(1);
                                            }}
                                            placeholder="Search assigned patients..."
                                            className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </div>
                                        <button
                                          onClick={() => setAddPatientOpen(true)}
                                          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 active:scale-98 transition-all shrink-0"
                                        >
                                          <UserPlus className="h-3.5 w-3.5" />
                                          <span>Add Patient</span>
                                        </button>
                                      </div>
                                    </div>

                                                    {/* Mobile View for Assigned Patients (App Cards) */}
                                                    <div className="block md:hidden space-y-2.5">
                                                      {patientsLoading ? (
                                                        Array.from({ length: 3 }).map((_, i) => (
                                                          <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
                                                        ))
                                                      ) : !patientsData?.patients || patientsData.patients.length === 0 ? (
                                                        <div className="rounded-xl border border-slate-200 bg-white p-6">
                                                          <EmptyState
                                                            icon={Users}
                                                            title="No assigned patients"
                                                            description="Assign or register a patient under this doctor."
                                                            action={{ label: "Add Patient", onClick: () => setAddPatientOpen(true) }}
                                                          />
                                                        </div>
                                                      ) : (
                                                        patientsData.patients.map((patient) => (
                                                          <div
                                                            key={patient._id}
                                                            className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs"
                                                          >
                                                            <div className="flex items-start justify-between gap-2">
                                                              <div>
                                                                <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                                                                <div className="text-xs text-slate-500 mt-0.5">
                                                                  {patient.age}y · {patient.gender} · {patient.condition}
                                                                </div>
                                                              </div>

                                                              <div className="flex items-center gap-1">
                                                                <button
                                                                  onClick={() => setUnassigningPatient(patient)}
                                                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                                  title="Unassign patient"
                                                                >
                                                                  <UserMinus className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                  onClick={() => setDeletingPatient(patient)}
                                                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                  title="Delete patient"
                                                                >
                                                                  <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                              </div>
                                                </div>

                                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                                  <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border ${STATUS_STYLES[patient.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                                                      }`}
                                                  >
                                                    {patient.status}
                                                  </span>

                                                  <span className="text-[11px] text-slate-400">
                                                    Admitted: {formatDate(patient.admissionDate)}
                                                  </span>
                                                </div>
                                              </div>
                                            ))
                                          )}

                                          {patientsData?.pagination && patientsData.pagination.totalRecords > 0 && (
                                            <div className="rounded-xl border border-slate-200 bg-white">
                                              <DataTablePagination
                                                pagination={patientsData.pagination}
                                                limit={limit}
                                                onPageChange={setPage}
                                                onLimitChange={(l) => {
                                                  setLimit(l);
                                                  setPage(1);
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>

                                          {/* Desktop View for Assigned Patients (Table) */ }
                                          < div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-sm">
                                            <thead>
                                              <tr className="border-b border-slate-100 bg-slate-50/80">
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                  Patient
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                  Condition
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                  Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                  Admission
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                  Actions
                                                </th>
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
                                                  <tr key={patient._id} className="hover:bg-slate-50/90 transition-colors">
                                                    <td className="px-4 py-3">
                                                      <div className="font-semibold text-slate-900">{patient.name}</div>
                                                      <div className="text-xs text-slate-400">
                                                        {patient.age}y · {patient.gender}
                                                      </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{patient.condition}</td>
                                                    <td className="px-4 py-3">
                                                      <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_STYLES[patient.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                                                          }`}
                                                      >
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
                                                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
                                            onLimitChange={(l) => {
                                              setLimit(l);
                                              setPage(1);
                                            }}
                                          />
                                        )}
                                    </div>
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
                                    description={`Remove Dr. ${doctor.name} from the system? Their ${doctor.patientCount ?? 0
                                      } patient(s) will be unassigned but records preserved.`}
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
