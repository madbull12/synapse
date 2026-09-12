import { APIError } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { workspaceService } from "@/features/workspace/service";

export const useWorkspaces = (userId: string) => {
  return useQuery<any, AxiosError<APIError>>({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.getUserWorkspaces(userId),
    enabled: !!userId, // Only run the query if userId is provided
  });
};
