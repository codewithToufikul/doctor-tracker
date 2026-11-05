"use client";

import { TrendingUp, Users, Stethoscope, AlertCircle, Activity } from "lucide-react";
import { useAnalyticsOverview, usePatientsPerDoctor, useAdmissionTrends, useConditionDistribution } from "@/hooks/useAnalytics";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatShortDate } from "@/lib/utils";

const CONDITION_COLORS = [
  "#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626",
  "#0891B2", "#65A30D", "#DB2777", "#EA580C", "#6366F1",
];

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: perDoctor, isLoading: perDoctorLoading } = usePatientsPerDoctor(10);
  const { data: trends, isLoading: trendsLoading } = useAdmissionTrends(30);
  const { data: conditions, isLoading: conditionsLoading } = useConditionDistribution();

  const formattedTrends = trends?.map((t: { date: string; admissions: number }) => ({
    ...t,
    date: formatShortDate(t.date),
  }));

  return (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-slate-900">Clinical Operations Dashboard</h1>
              <p className="mt-0.5 text-sm text-slate-500">Real-time practitioner metrics, patient loads, and admission analytics.</p>
            </div>

            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {overviewLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
                ))
              ) : (
                <>
                  <KpiCard
                    icon={Stethoscope}
                    label="Total Doctors"
                    value={overview?.totalDoctors ?? 0}
                    sub={`Avg ${overview?.averagePatientsPerDoctor?.toFixed(1) ?? 0} patients/doctor`}
                    color="bg-blue-50 text-blue-600"
                  />
                  <KpiCard
                    icon={Users}
                    label="Total Patients"
                    value={overview?.totalPatients ?? 0}
                    sub={`${overview?.unassignedPatients ?? 0} unassigned`}
                    color="bg-indigo-50 text-indigo-600"
                  />
                  <KpiCard
                    icon={Activity}
                    label="Active Patients"
                    value={overview?.activePatientsCount ?? 0}
                    sub={`${overview?.underTreatmentCount ?? 0} under treatment`}
                    color="bg-emerald-50 text-emerald-600"
                  />
                  <KpiCard
                    icon={AlertCircle}
                    label="Critical Cases"
                    value={overview?.criticalPatientsCount ?? 0}
                    sub={`${overview?.dischargedCount ?? 0} discharged`}
                    color="bg-rose-50 text-rose-600"
                  />
                </>
              )}
            </div>

            {/* Charts Row 1 */}
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Admission Trends */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">Admission Trends</h2>
                  <span className="ml-auto text-xs text-slate-400">Last 30 days</span>
                </div>
                {trendsLoading ? (
                  <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={formattedTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="admissionsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                        labelStyle={{ color: "#475569", fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="admissions" stroke="#2563EB" strokeWidth={2} fill="url(#admissionsGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Condition Distribution */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">Condition Distribution</h2>
                </div>
                {conditionsLoading ? (
                  <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={conditions}
                          dataKey="count"
                          nameKey="condition"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={2}
                        >
                          {conditions?.map((entry, i: number) => (
                            <Cell key={i} fill={CONDITION_COLORS[i % CONDITION_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                          formatter={(val: number, name: string) => [`${val} patients`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 w-full space-y-1.5">
                      {conditions?.slice(0, 5).map((c, i) => (
                        <div key={c.condition} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: CONDITION_COLORS[i % CONDITION_COLORS.length] }} />
                            <span className="text-slate-600">{c.condition}</span>
                          </div>
                          <span className="font-medium text-slate-900">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

              {/* Patients Per Doctor */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-900">Patient Load by Practitioner</h2>
                  <p className="text-xs text-slate-400">Top 10 doctors by assigned patient count</p>
                </div>
                {perDoctorLoading ? (
                  <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={perDoctor?.map((d) => ({ name: d.doctorName.split(" ").slice(-1)[0], count: d.patientCount, full: d.doctorName }))}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                        formatter={(val: any, _name: any, item: any) => [val, item?.payload?.full ?? 'Doctor']}
                      />
                      <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            );
}
