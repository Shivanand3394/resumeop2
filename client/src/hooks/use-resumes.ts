import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateResumeInput, type UpdateResumeInput, type ResumeResponse } from "@shared/routes";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export function useResumes() {
  return useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: () => apiClient.resumes.list(),
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: [api.resumes.get.path, id],
    queryFn: () => apiClient.resumes.get(id),
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateResumeInput) => apiClient.resumes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({ title: "Resume created" });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & UpdateResumeInput) => 
      apiClient.resumes.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.resumes.get.path, variables.id] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiClient.resumes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({ title: "Deleted" });
    },
  });
}

export function useDuplicateResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiClient.resumes.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({ title: "Duplicated" });
    },
  });
}
