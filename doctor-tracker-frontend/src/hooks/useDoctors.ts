import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Doctor, Patient, PaginationMeta } from "@/types";

interface DoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface DoctorsResponse {
  doctors: Doctor[];
  pagination: PaginationMeta;
}

interface DoctorPatientsResponse {
  patients: Patient[];
  pagination: PaginationMeta;
}

export function useDoctors(params: DoctorsParams = {}) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: DoctorsResponse }>("/doctors", { params });
      return data.data;
    },
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Doctor }>(`/doctors/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useDoctorPatients(id: string, params: DoctorsParams = {}) {
  return useQuery({
    queryKey: ["doctors", id, "patients", params],
    queryFn: async () => {
      const { data } = await api.get<{ data: DoctorPatientsResponse }>(`/doctors/${id}/patients`, { params });
      return data.data;
    },
    enabled: !!id,
  });
}

export function useAllDoctors() {
  return useQuery({
    queryKey: ["doctors", "all"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DoctorsResponse }>("/doctors", { params: { limit: 200 } });
      return data.data.doctors;
    },
    staleTime: 60_000,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<{ data: Doctor }>("/doctors", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await api.put<{ data: Doctor }>(`/doctors/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useAddPatientToDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ doctorId, payload }: { doctorId: string; payload: Record<string, unknown> }) => {
      const { data } = await api.post<{ data: Patient }>(`/doctors/${doctorId}/patients`, payload);
      return data.data;
    },
    onSuccess: (_data, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: ["doctors", doctorId, "patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useRemovePatientFromDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ doctorId, patientId }: { doctorId: string; patientId: string }) => {
      await api.patch(`/doctors/${doctorId}/patients/${patientId}/remove`);
    },
    onSuccess: (_data, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: ["doctors", doctorId, "patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useDeletePatientFromDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ doctorId, patientId }: { doctorId: string; patientId: string }) => {
      await api.delete(`/doctors/${doctorId}/patients/${patientId}`);
    },
    onSuccess: (_data, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: ["doctors", doctorId, "patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

