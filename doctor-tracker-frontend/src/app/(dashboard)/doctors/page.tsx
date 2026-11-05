'use client';

import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Doctor Management Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, and manage registered medical practitioners.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
        <Stethoscope className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">Practitioner Directory Ready</p>
        <p className="text-xs text-slate-400 mt-1">Interactive data table connecting in Phase 5.</p>
      </div>
    </div>
  );
}
