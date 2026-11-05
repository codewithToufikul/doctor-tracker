import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { DashboardOverview, PatientsPerDoctor, AdmissionTrend, ConditionDistribution } from "@/types";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardOverview }>("/analytics/overview");
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function usePatientsPerDoctor(limit = 10) {
  return useQuery({
    queryKey: ["analytics", "patients-per-doctor", limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: PatientsPerDoctor[] }>("/analytics/patients-per-doctor", {
        params: { limit },
      });
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useAdmissionTrends(days = 30) {
  return useQuery({
    queryKey: ["analytics", "trends", days],
    queryFn: async () => {
      const { data } = await api.get<{ data: AdmissionTrend[] }>("/analytics/trends", { params: { days } });
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useConditionDistribution() {
  return useQuery({
    queryKey: ["analytics", "conditions"],
    queryFn: async () => {
      const { data } = await api.get<{ data: ConditionDistribution[] }>("/analytics/conditions-distribution");
      return data.data;
    },
    staleTime: 30_000,
  });
}

