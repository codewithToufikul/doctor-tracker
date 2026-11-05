"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

  export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isLoading = false,
    variant = "danger",
  }: ConfirmDialogProps) {
    if (!isOpen) return null;

    const confirmClass =
      variant === "warning"
          ? "bg-amber-600 hover:bg-amber-700 text-white"
          : "bg-rose-600 hover:bg-rose-700 text-white";

    const iconClass =
      variant === "warning" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600";

    return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={onClose}
            />

        {/* Dialog box / Bottom sheet */}
        <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-start gap-3.5 mb-4">
            <div className={`shrink-0 rounded-xl p-2.5 ${iconClass}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm ${confirmClass}`}
            >
              {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
