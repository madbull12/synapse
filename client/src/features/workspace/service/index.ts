import { privateApi } from "@/lib/api";
import {
  CreateWorkspaceDTO,
  WorkspaceResponse,
} from "@/features/workspace/types/api";

export const workspaceService = {
  async getUserWorkspaces(): Promise<WorkspaceResponse> {
    const res = await privateApi.get<WorkspaceResponse>(`/workspaces`);
    return res.data;
  },

  async createWorkspace(data: CreateWorkspaceDTO) {
    const res = await privateApi.post<any>("/workspaces", data);
    return res.data;
  },

  async getWorkspaceForUser(workspaceId: string): Promise<WorkspaceResponse> {
    const res = await privateApi.get<WorkspaceResponse>(
      `/workspaces/${workspaceId}`,
    );
    return res.data;
  },
};
