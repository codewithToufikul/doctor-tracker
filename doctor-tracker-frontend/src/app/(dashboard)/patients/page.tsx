"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  X,
  Users,
  Pencil,
  Trash2,
  Filter,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Activity,
} from "lucide-react";
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
  Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Under Treatment": "bg-amber-50 text-amber-700 border-amber-100",
  Critical: "bg-rose-50 text-rose-700 border-rose-100",
  Discharged: "bg-slate-100 text-slate-600 border-slate-200",
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  if (doctorFilter === "unassigned") {
    queryParams.doctorId = "null";
  } else if (doctorFilter) {
    queryParams.doctorId = doctorFilter;
  }

  const { data, isLoading } = usePatients(queryParams);

  const hasFilters =
    !!search || !!condition || !!status || !!doctorFilter || !!startDate || !!endDate;

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
    <div className="space-y-4">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Patient Directory
            </h1>
            {data?.pagination && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {data.pagination.totalRecords}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Comprehensive patient directory with clinical condition and date filtering.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-98 transition-all shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search patient name, phone, email..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                showMobileFilters || hasFilters
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "border-slate-200 text-slate-600 bg-white"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Desktop Filter Row / Mobile Expandable Drawer */}
          <div
            className={`flex flex-wrap items-center gap-2.5 pt-1 ${
              showMobileFilters ? "flex" : "hidden sm:flex"
            }`}
          >
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-initial rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Conditions</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-initial rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {PATIENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={doctorFilter}
              onChange={(e) => {
                setDoctorFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Doctors</option>
              <option value="unassigned">Unassigned Patients</option>
              {doctors?.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="flex-1 sm:flex-initial rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] font-medium text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="flex-1 sm:flex-initial rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors ml-auto"
              >
                <X className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View (App-like, visible on screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
          ))
        ) : !data?.patients || data.patients.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <EmptyState
              icon={Users}
              title="No patients found"
              description={hasFilters ? "Try adjusting your filters." : "Register the first patient to get started."}
              action={!hasFilters ? { label: "Add Patient", onClick: openCreate } : undefined}
            />
          </div>
        ) : (
          data.patients.map((patient) => (
            <div
              key={patient._id}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {patient.age}y · {patient.gender}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-600 font-medium">{patient.condition}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => openEdit(patient, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPatient(patient)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Status and Doctor row */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {patient.status === "Critical" && (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  )}
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                      STATUS_STYLES[patient.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Stethoscope className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  {patient.doctor ? (
                    <span className="font-medium text-slate-800">{patient.doctor.name}</span>
                  ) : (
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-medium border border-amber-200/60">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>

              {/* Footer info: phone & admission date */}
              <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
                <a
                  href={`tel:${patient.phone}`}
                  className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium"
                >
                  <Phone className="h-3 w-3" />
                  <span>{patient.phone}</span>
                </a>

                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Admitted: {formatDate(patient.admissionDate)}</span>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {data?.pagination && data.pagination.totalRecords > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white">
            <DataTablePagination
              pagination={data.pagination}
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

      {/* Desktop Table View (visible on screens >= 768px) */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Condition
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assigned Doctor
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
              {isLoading ? (
                <TableSkeleton cols={8} rows={limit} />
              ) : !data?.patients || data.patients.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Users}
                      title="No patients found"
                      description={
                        hasFilters
                          ? "Try adjusting your filters."
                          : "Register the first patient to get started."
                      }
                      action={!hasFilters ? { label: "Add Patient", onClick: openCreate } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                data.patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/90 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-400">{patient.age} years old</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-medium">{patient.phone}</div>
                      {patient.email && (
                        <div
                          className="text-xs text-slate-400 truncate max-w-[140px]"
                          title={patient.email}
                        >
                          {patient.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.condition}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {patient.status === "Critical" && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                        )}
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            STATUS_STYLES[patient.status] ?? "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {patient.doctor ? (
                        <span className="text-slate-800 font-medium">{patient.doctor.name}</span>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          Unassigned
                        </span>
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
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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

        {data?.pagination && data.pagination.totalRecords > 0 && (
          <DataTablePagination
            pagination={data.pagination}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
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
