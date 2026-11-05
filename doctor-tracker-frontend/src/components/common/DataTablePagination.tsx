"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { PaginationMeta } from "@/types";

interface DataTablePaginationProps {
  pagination: PaginationMeta;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

  export default function DataTablePagination({ pagination, limit, onPageChange, onLimitChange }: DataTablePaginationProps) {
    const { currentPage, totalPages, totalRecords, hasPrevPage, hasNextPage } = pagination;
    const startRecord = (currentPage - 1) * limit + 1;
    const endRecord = Math.min(currentPage * limit, totalRecords);

    return (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-4 py-3 text-xs text-slate-600 sm:flex-row">
            <div className="flex items-center gap-4">
              <span>
                Showing <strong className="text-slate-900">{startRecord}</strong>–
                <strong className="text-slate-900">{endRecord}</strong> of{" "}
                <strong className="text-slate-900">{totalRecords}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={!hasPrevPage}
                onClick={() => onPageChange(1)}
                className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button
                disabled={!hasPrevPage}
                onClick={() => onPageChange(currentPage - 1)}
                className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
                <span className="rounded bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={!hasNextPage}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={!hasNextPage}
                  onClick={() => onPageChange(totalPages)}
                  className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </button>
            </div>
          </div>
          );
}
