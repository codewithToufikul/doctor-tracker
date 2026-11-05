"use client";

import Link from "next/link";
import {
  TrendingUp,
  Users,
  Stethoscope,
  AlertCircle,
  Activity,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import {
  useAnalyticsOverview,
  usePatientsPerDoctor,
  useAdmissionTrends,
  useConditionDistribution,
} from "@/hooks/useAnalytics";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatShortDate } from "@/lib/utils";

const CONDITION_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#65A30D",
  "#DB2777",
  "#EA580C",
  "#6366F1",
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
    <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="mb-2 sm:mb-3 flex items-center gap-2.5 sm:gap-3">
        <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl ${color}`}>
          <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-[11px] sm:text-xs text-slate-400 truncate">{sub}</p>}
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
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Clinical Operations
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Real-time practitioner metrics, patient loads, and admission analytics.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/doctors"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all shadow-2xs"
          >
            <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
            <span>Manage Doctors</span>
          </Link>
          <Link
            href="/patients"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 active:scale-98 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Patient</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 sm:h-28 animate-pulse rounded-xl sm:rounded-2xl bg-slate-200/80" />
          ))
        ) : (
          <>
            <KpiCard
              icon={Stethoscope}
              label="Total Doctors"
              value={overview?.totalDoctors ?? 0}
              sub={`Avg ${overview?.averagePatientsPerDoctor?.toFixed(1) ?? 0} pts/doc`}
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
              label="Active Cases"
              value={overview?.activePatientsCount ?? 0}
              sub={`${overview?.underTreatmentCount ?? 0} under care`}
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Admission Trends */}
        <div className="lg:col-span-2 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Admission Frequency
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Past 30 days</span>
          </div>

          {trendsLoading ? (
            <div className="h-48 sm:h-56 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={formattedTrends} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="admissionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  labelStyle={{ color: "#475569", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="admissions"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#admissionsGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Condition Distribution */}
        <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Clinical Conditions
            </h2>
            <p className="text-[11px] text-slate-400">Diagnosis classification breakdown</p>
          </div>

          {conditionsLoading ? (
            <div className="h-48 sm:h-56 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={conditions}
                    dataKey="count"
                    nameKey="condition"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {conditions?.map((entry, i: number) => (
                      <Cell key={i} fill={CONDITION_COLORS[i % CONDITION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(val: any, name: any) => [`${val} patients`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-2 w-full space-y-1.5">
                {conditions?.slice(0, 4).map((c, i) => (
                  <div key={c.condition} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: CONDITION_COLORS[i % CONDITION_COLORS.length] }}
                      />
                      <span className="text-slate-600 truncate">{c.condition}</span>
                    </div>
                    <span className="font-semibold text-slate-900 ml-2">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patients Per Doctor Bar Chart */}
      <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Patient Load by Practitioner
            </h2>
            <p className="text-[11px] text-slate-400">Top 10 doctors ranked by assigned workload</p>
          </div>
          <Link
            href="/doctors"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>All Doctors</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {perDoctorLoading ? (
          <div className="h-48 sm:h-56 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={perDoctor?.map((d) => ({
                name: d.doctorName.split(" ").slice(-1)[0],
                count: d.patientCount,
                full: d.doctorName,
              }))}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(val: any, _name: any, item: any) => [
                  `${val} patients`,
                  item?.payload?.full ?? "Doctor",
                ]}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
