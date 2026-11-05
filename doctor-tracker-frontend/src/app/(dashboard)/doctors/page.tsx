"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X, Stethoscope, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDoctors, useDeleteDoctor } from "@/hooks/useDoctors";
import { useDebounce } from "@/hooks/useDebounce";
import DoctorFormModal from "@/components/doctors/DoctorFormModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTablePagination from "@/components/common/DataTablePagination";
import TableSkeleton from "@/components/common/TableSkeleton";
import EmptyState from "@/components/common/EmptyState";
import { formatDate, getInitials } from "@/lib/utils";
import { SPECIALIZATIONS } from "@/validations/doctor.schema";
import type { Doctor } from "@/types";

export default function DoctorsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | undefined>();
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | undefined>();

  const debouncedSearch = useDebounce(search, 400);
  const deleteDoctor = useDeleteDoctor();

  const { data, isLoading } = useDoctors({
    page,
    limit,
    search: debouncedSearch || undefined,
    specialization: specialization || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const hasFilters = !!search || !!specialization || !!startDate || !!endDate;

  const clearFilters = () => {
    setSearch("");
    setSpecialization("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deletingDoctor) return;
    try {
      await deleteDoctor.mutateAsync(deletingDoctor._id);
      toast.success(`Dr. ${deletingDoctor.name} removed. Assigned patients have been unassigned.`);
      setDeletingDoctor(undefined);
    } catch {
      toast.error("Failed to delete doctor");
    }
  };

  const openCreate = () => {
    setEditingDoctor(undefined);
    setModalOpen(true);
  };

  const openEdit = (doctor: Doctor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDoctor(doctor);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Doctor Management Directory</h1>
          <p className="mt-0.5 text-sm text-slate-500">Browse, search, and manage registered medical practitioners.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, hospital, email..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={specialization}
            onChange={(e) => { setSpecialization(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Doctor</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Specialization</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Hospital</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Contact</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-slate-500">Patients</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableSkeleton cols={7} rows={limit} />
              ): !data?.doctors || data.doctors.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Stethoscope}
                    title="No doctors found"
                    description={hasFilters ? "Try adjusting your filters." : "Register the first practitioner to get started."}
                    action={!hasFilters ? { label: "Add Doctor", onClick: openCreate } : undefined}
                  />
                </td>
              </tr>
              ) : (
                      data.doctors.map((doctor) => (
              <tr
                key={doctor._id}
                onClick={() => router.push(`/doctors/${doctor._id}`)}
                className="cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {getInitials(doctor.name)}
                    </div>
                    <span className="font-medium text-slate-900">{doctor.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {doctor.specialization}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{doctor.hospital}</td>
                <td className="px-4 py-3">
                  <div className="text-slate-600">{doctor.phone}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[160px]" title={doctor.email}>{doctor.email}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                    {doctor.patientCount ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(doctor.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openEdit(doctor, e)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingDoctor(doctor); }}
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

          { data?.pagination && data.pagination.totalRecords > 0 && (
            <DataTablePagination
              pagination={data.pagination}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
            />
          )}
      </div>

      <DoctorFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        doctor={editingDoctor}
      />

      <ConfirmDialog
        isOpen={!!deletingDoctor}
        onClose={() => setDeletingDoctor(undefined)}
        onConfirm={handleDelete}
        title="Delete Doctor"
        description={
          deletingDoctor
            ? `Remove Dr. ${deletingDoctor.name} from the system? Their ${deletingDoctor.patientCount ?? 0} assigned patient(s) will be unassigned but not deleted.`
            : ""
        }
        confirmLabel="Delete Doctor"
        isLoading={deleteDoctor.isPending}
      />
    </div>
  );
}
