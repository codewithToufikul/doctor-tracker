'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Stethoscope } from 'lucide-react';

export default function DoctorDetailPage() {
  const params = useParams();
  const doctorId = params?.id as string;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Doctor Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Doctor ID: {doctorId}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
        <Stethoscope className="w-8 h-8 text-blue-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">Doctor Profile & Assigned Patients View</p>
        <p className="text-xs text-slate-400 mt-1">Detailed profile and patient sub-table connecting in Phase 5.</p>
      </div>
    </div>
  );
}
