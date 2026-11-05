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
      ? "bg-amber-500 hover:bg-amber-600 text-white"
      : "bg-rose-600 hover:bg-rose-700 text-white";

  const iconClass =
    variant === "warning" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600";

  return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={onClose} />
              <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-start gap-3.5">
                  <div className={`shrink-0 rounded-full p-2.5 ${iconClass}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                </div>

                  <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={onClose}
                      className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {cancelLabel}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={onConfirm}
                      className={`inline-flex items-center rounded-lg px-4 py-2 text-xs font-medium disabled:opacity-50 transition-colors ${confirmClass}`}
                    >
                      {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      {confirmLabel}
                    </button>
                  </div>
                </div>
              </div>
              );
}
