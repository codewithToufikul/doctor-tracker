"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  X,
  Stethoscope,
  Pencil,
  Trash2,
  Building2,
  Phone,
  Mail,
  Users,
  ChevronRight,
  Filter,
} from "lucide-react";
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
        <div className="space-y-4">
          {/* Top Banner / Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Doctors Directory
                </h1>
                {data?.pagination && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {data.pagination.totalRecords}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Browse, search, and manage registered medical practitioners.
              </p>
            </div>

            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-98 transition-all shadow-sm w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Doctor</span>
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
                          placeholder="Search name, hospital, email..."
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
                        className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${showMobileFilters || hasFilters
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
                      className={`flex flex-wrap items-center gap-2.5 pt-1 ${showMobileFilters ? "flex" : "hidden sm:flex"
                        }`}
                    >
                    <select
                      value={specialization}
                      onChange={(e) => {
                        setSpecialization(e.target.value);
                        setPage(1);
                      }}
                      className="flex-1 sm:flex-initial rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-800 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Specializations</option>
                      {SPECIALIZATIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
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
                  ) : !data?.doctors || data.doctors.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                      <EmptyState
                        icon={Stethoscope}
                        title="No doctors found"
                        description={hasFilters ? "Try adjusting your filters." : "Register the first practitioner to get started."}
                        action={!hasFilters ? { label: "Add Doctor", onClick: openCreate } : undefined}
                      />
                    </div>
                  ) : (
                    data.doctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        onClick={() => router.push(`/doctors/${doctor._id}`)}
                        className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs active:scale-[0.99] transition-all cursor-pointer relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 shadow-2xs">
                              {getInitials(doctor.name)}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-900 truncate">{doctor.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                                  {doctor.specialization}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => openEdit(doctor, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingDoctor(doctor);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Meta information */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{doctor.hospital}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${doctor.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="truncate hover:text-blue-600"
                            >
                              {doctor.phone}
                            </a>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100/80 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                            <span>
                              <strong className="text-slate-900">{doctor.patientCount ?? 0}</strong> assigned
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-blue-600 font-medium text-xs">
                            <span>View Profile</span>
                            <ChevronRight className="h-3.5 w-3.5" />
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
                              Doctor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Specialization
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Hospital
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Contact
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Patients
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Joined
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Actions
                            </th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                          <TableSkeleton cols={7} rows={limit} />
                        ) : !data?.doctors || data.doctors.length === 0 ? (
                          <tr>
                            <td colSpan={7}>
                              <EmptyState
                                icon={Stethoscope}
                                title="No doctors found"
                                description={
                                  hasFilters
                                    ? "Try adjusting your filters."
                                    : "Register the first practitioner to get started."
                                }
                                action={!hasFilters ? { label: "Add Doctor", onClick: openCreate } : undefined}
                              />
                            </td>
                          </tr>
                        ) : (
                data.doctors.map((doctor) => (
                        <tr
                          key={doctor._id}
                          onClick={() => router.push(`/doctors/${doctor._id}`)}
                          className="cursor-pointer hover:bg-slate-50/90 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                                {getInitials(doctor.name)}
                              </div>
                              <span className="font-semibold text-slate-900">{doctor.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                              {doctor.specialization}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{doctor.hospital}</td>
                          <td className="px-4 py-3">
                            <div className="text-slate-700 font-medium">{doctor.phone}</div>
                            <div
                              className="text-xs text-slate-400 truncate max-w-[160px]"
                              title={doctor.email}
                            >
                              {doctor.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-blue-50 px-2 text-xs font-semibold text-blue-700 border border-blue-100">
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingDoctor(doctor);
                                }}
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
                        ? `Remove Dr. ${deletingDoctor.name} from the system? Their ${deletingDoctor.patientCount ?? 0
                        } assigned patient(s) will be unassigned but not deleted.`
                        : ""
        }
                  confirmLabel="Delete Doctor"
                  isLoading={deleteDoctor.isPending}
                />
              </div>
              );
}
