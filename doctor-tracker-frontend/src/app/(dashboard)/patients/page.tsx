"use client";

import { useState } from "react";
import { Plus, Search, X, Users } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePatients, useDeletePatient } from "@/hooks/usePatients";
import { useAllDoctors } from "@/hooks/useDoctors";
import { useDebounce } from "@/hooks/useDebounce";
import PatientFormModal from "@/components/patients/PatientFormModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTablePagination from "@/components/common/DataTablePagination";
import TableSkeleton from "@/components/common/TableSkeleton";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils";
import { CONDITIONS, PATIENT_STATUSES } from "@/validations/patient.schema";
import type { Patient } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "Under Treatment": "bg-amber-50 text-amber-700",
  Critical: "bg-rose-50 text-rose-700",
  Discharged: "bg-slate-100 text-slate-600",
};

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [deletingPatient, setDeletingPatient] = useState<Patient | undefined>();

  const debouncedSearch = useDebounce(search, 400);
  const deletePatient = useDeletePatient();
  const { data: doctors } = useAllDoctors();

  const queryParams: Record<string, string | number | undefined> = {
    page,
    limit,
    search: debouncedSearch || undefined,
    condition: condition || undefined,
    status: status || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  // "unassigned" is a special filter value meaning doctorId = null
  if (doctorFilter === "unassigned") {
    queryParams.doctorId = "null";
  } else if (doctorFilter) {
    queryParams.doctorId = doctorFilter;
  }

  const { data, isLoading } = usePatients(queryParams);

  const hasFilters = !!search || !!condition || !!status || !!doctorFilter || !!startDate || !!endDate;

  const clearFilters = () => {
    setSearch("");
    setCondition("");
    setStatus("");
    setDoctorFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingPatient) return;
    try {
      await deletePatient.mutateAsync(deletingPatient._id);
      toast.success(`${deletingPatient.name}'s record deleted`);
      setDeletingPatient(undefined);
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  const openCreate = () => {
    setEditingPatient(undefined);
    setModalOpen(true);
  };

  const openEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatient(patient);
    setModalOpen(true);
  };

  return (
        <div>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Patient Management Directory</h1>
              <p className="mt-0.5 text-sm text-slate-500">Comprehensive patient directory with clinical condition and date filtering.</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </button>
          </div>

            {/* Filters */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by name, phone, email..."
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={condition}
                  onChange={(e) => { setCondition(e.target.value); setPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Conditions</option>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {PATIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={doctorFilter}
                  onChange={(e) => { setDoctorFilter(e.target.value); setPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Doctors</option>
                  <option value="unassigned">Unassigned</option>
                  {doctors?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Assigned Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Admission</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <TableSkeleton cols={8} rows={limit} />
                    ) : !data?.patients.length ? (
                      <tr>
                        <td colSpan={8}>
                          <EmptyState
                            icon={Users}
                            title="No patients found"
                            description={hasFilters ? "Try adjusting your filters." : "Register the first patient to get started."}
                            action={!hasFilters ? { label: "Add Patient", onClick: openCreate } : undefined}
                          />
                        </td>
                      </tr>
                    ) : (
                      data.patients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{patient.name}</div>
                            <div className="text-xs text-slate-400">{patient.age} years old</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {patient.gender}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-slate-600">{patient.phone}</div>
                            {patient.email && <div className="text-xs text-slate-400 truncate max-w-[140px]">{patient.email}</div>}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{patient.condition}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {patient.status === "Critical" && (
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                              )}
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[patient.status] ?? "bg-slate-100 text-slate-600"}`}>
                                {patient.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {patient.doctor ? (
                              <span className="text-slate-700">{patient.doctor.name}</span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(patient.admissionDate)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={(e) => openEdit(patient, e)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingPatient(patient)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Delete"
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

              {data?.pagination && data.pagination.totalPages > 1 && (
                <DataTablePagination
                  pagination={data.pagination}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(l) => { setLimit(l); setPage(1); }}
                />
              )}
            </div>

            <PatientFormModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              patient={editingPatient}
            />

            <ConfirmDialog
              isOpen={!!deletingPatient}
              onClose={() => setDeletingPatient(undefined)}
              onConfirm={handleDelete}
              title="Delete Patient Record"
              description={`Permanently delete ${deletingPatient?.name}'s clinical record? This action cannot be undone.`}
              confirmLabel="Delete Record"
              isLoading={deletePatient.isPending}
            />
          </div>
          );
}
