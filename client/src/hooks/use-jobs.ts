import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateJobInput, type UpdateJobInput } from "@shared/routes";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export function useJobs() {
  return useQuery({
    queryKey: [api.jobs.list.path],
    queryFn: () => apiClient.jobs.list(),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateJobInput) => apiClient.jobs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({ title: "Job added" });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & UpdateJobInput) => 
      apiClient.jobs.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiClient.jobs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({ title: "Job deleted" });
    },
  });
}
