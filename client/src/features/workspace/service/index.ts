import { privateApi, publicApi } from "@/lib/api";
import {
  AcceptInvitationDTO,
  AddMemberToWorkspaceDTO,
  CreateWorkspaceDTO,
  SendInvitationDTO,
  VerifyInvitationResponse,
  WorkspaceByIdResponse,
  WorkspaceResponse,
} from "@/features/workspace/types/api";
import { APIResponse } from "@/types";

export const workspaceService = {
  async getUserWorkspaces(): Promise<WorkspaceResponse> {
    const res = await privateApi.get<WorkspaceResponse>(`/workspaces`);
    return res.data;
  },
  async verifyInvitation(token: string): Promise<VerifyInvitationResponse> {
    const res = await publicApi.get<VerifyInvitationResponse>(
      `/workspaces/invitations/verify`,
      { params: { token } }
    );
    return res.data;
  },

  async acceptInvitation(data: AcceptInvitationDTO): Promise<APIResponse<string>> {
    const res = await privateApi.post<APIResponse<string>>(
      `/workspaces/invitations/${data.token}/accept`,
      { name: data.name, password: data.password }
    );
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


};
