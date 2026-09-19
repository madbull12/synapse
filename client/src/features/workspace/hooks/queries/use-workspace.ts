import { APIError } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { workspaceService } from "@/features/workspace/service";
import { WorkspaceResponse } from "@/features/workspace/types/api";

export const useWorkspaces = (userId: string) => {
  return useQuery<WorkspaceResponse, AxiosError<APIError>>({
    queryKey: ["workspaces", userId],
    queryFn: () => workspaceService.getUserWorkspaces(),
    enabled: !!userId, // Only run the query if userId is provided
  });
};

export const useWorkspaceById = (workspaceId: string) => {
  return useQuery<any, AxiosError<APIError>>({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspaceForUser(workspaceId),
    enabled: !!workspaceId, // Only run the query if workspaceId is provided
  });
};
