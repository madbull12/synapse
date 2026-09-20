import { privateApi } from "@/lib/api";
import {
  CreateWorkspaceDTO,
  WorkspaceByIdResponse,
  WorkspaceResponse,
} from "@/features/workspace/types/api";

export const workspaceService = {
  async getUserWorkspaces(): Promise<WorkspaceResponse> {
    const res = await privateApi.get<WorkspaceResponse>(`/workspaces`);
    return res.data;
  },

  async createWorkspace(data: CreateWorkspaceDTO) {
    const res = await privateApi.post("/workspaces", data);
    return res.data;
  },

  async getWorkspaceById(workspaceId: string): Promise<WorkspaceByIdResponse> {
    const res = await privateApi.get<WorkspaceByIdResponse>(
      `/workspaces/${workspaceId}`,
    );
    return res.data;
  },
};
