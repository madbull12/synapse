import { UserId } from "@/features/auth/store/use-auth-store";
import { privateApi } from "@/lib/api";

export const workspaceService = {
  async getUserWorkspaces(userId: UserId): Promise<any> {
    const res = await privateApi.get<any>(`/workspaces`);
    return res.data.data;
  },
};
