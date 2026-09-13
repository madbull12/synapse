import { privateApi } from "@/lib/api";
import { CreateWorkspaceDTO } from "@/features/workspace/types/api";

export const workspaceService = {
  async getUserWorkspaces(): Promise<any> {
    const res = await privateApi.get<any>(`/workspaces`);
    return res.data.data;
  },

  async createWorkspace(data: CreateWorkspaceDTO): Promise<any> {
    const res = await privateApi.post<any>("/workspaces", data);
    return res.data;
  },
};
