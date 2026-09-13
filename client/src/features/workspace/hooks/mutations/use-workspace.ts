import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/features/workspace/service";
import { APIError, APIResponse } from "@/types";
import { AxiosError } from "axios";
import { CreateWorkspaceDTO } from "@/features/workspace/types/api";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/use-auth-store";

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  return useMutation<
    APIResponse<any>,
    AxiosError<APIError>,
    CreateWorkspaceDTO
  >({
    mutationFn: (data) => workspaceService.createWorkspace(data),
    onSuccess: (data) => {
      console.log("Data: ", data);
      toast.success(data.message || "Workspace created successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", userId] });
    },
  });
};
