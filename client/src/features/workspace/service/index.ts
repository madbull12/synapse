import { privateApi } from "@/lib/api";
import {
  AddMemberToWorkspaceDTO,
  CreateWorkspaceDTO,
  SendInvitationDTO,
  WorkspaceByIdResponse,
  WorkspaceResponse,
} from "@/features/workspace/types/api";
import { APIResponse } from "@/types";

export const workspaceService = {
  async getUserWorkspaces(): Promise<WorkspaceResponse> {
    const res = await privateApi.get<WorkspaceResponse>(`/workspaces`);
    return res.data;
  },

  async createWorkspace(data: CreateWorkspaceDTO) {
    const res = await privateApi.post<APIResponse<string>>("/workspaces", data);
    return res.data;
  },

  async getWorkspaceById(workspaceId: string): Promise<WorkspaceByIdResponse> {
    const res = await privateApi.get<WorkspaceByIdResponse>(
      `/workspaces/${workspaceId}`,
    );
    return res.data;
  },

  async addMemberToWorkspace(
    data: AddMemberToWorkspaceDTO,
    workspaceId: string,
  ) {
    const res = await privateApi.post<APIResponse<string>>(
      `/${workspaceId}/members`,
      data,
    );

    return res.data;
  },

  async sendInvitation(workspaceId: string, data: SendInvitationDTO) {
    const res = await privateApi.post<APIResponse<string>>(
      `/workspaces/${workspaceId}/invitations`,
      data,
    );
    return res.data;
  },

  async acceptInvitation(invitationId: string) {
    const res = await privateApi.post<APIResponse<string>>(
      `/invitations/${invitationId}/accept`,
    );
    return res.data;
  },
};
