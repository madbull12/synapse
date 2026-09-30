import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/features/workspace/service";
import { APIError, APIResponse } from "@/types";
import { AxiosError } from "axios";
import { AddMemberToWorkspaceDTO, CreateWorkspaceDTO } from "@/features/workspace/types/api";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/use-auth-store";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  return useMutation<
    APIResponse<string>,
    AxiosError<APIError>,
    CreateWorkspaceDTO
  >({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: (data) => {
      console.log("Data: ", data);
      toast.success(data.message || "Workspace created successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", userId] });
    },
  });
};

export const useAddMemberToWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient()

  return useMutation<
    APIResponse<string>,
    AxiosError<APIError>,
    AddMemberToWorkspaceDTO
  >({
    mutationFn: (data) => workspaceService.addMemberToWorkspace(data, workspaceId),
    onSuccess: (data) => {
      toast.success(data.message || "Member added successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },

  })
}