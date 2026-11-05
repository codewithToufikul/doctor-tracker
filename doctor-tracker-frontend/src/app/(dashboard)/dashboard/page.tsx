'use client';

import React from 'react';
import { Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Clinical Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time practitioner metrics, patient loads, and admission analytics.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
        <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-pulse" />
        <p className="text-sm font-medium text-slate-700">Analytics & Visualizations Portal Ready</p>
        <p className="text-xs text-slate-400 mt-1">Interactive Recharts widgets connecting in Phase 6.</p>
      </div>
    </div>
  );
}
