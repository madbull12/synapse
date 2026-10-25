import { APIError } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { workspaceService } from "@/features/workspace/service";
import {
  VerifyInvitationResponse,
  WorkspaceByIdResponse,
  WorkspaceResponse,
} from "@/features/workspace/types/api";
import { UserId } from "@/features/auth/store/use-auth-store";

export const useWorkspaces = (userId: UserId) => {
  return useQuery<WorkspaceResponse, AxiosError<APIError>>({
    queryKey: ["workspaces", userId],
    queryFn: () => workspaceService.getUserWorkspaces(),
    enabled: !!userId,
  });
};

export const useWorkspaceById = (workspaceId: string) => {
  return useQuery<WorkspaceByIdResponse, AxiosError<APIError>>({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspaceById(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useVerifyInvitation = (token: string) => {
  return useQuery<VerifyInvitationResponse, AxiosError<APIError>>({
    queryKey: ["invitation", "verify", token],
    queryFn: () => workspaceService.verifyInvitation(token),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
