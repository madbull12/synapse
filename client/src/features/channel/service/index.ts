import { privateApi } from "@/lib/api";

export const channelService = {
  async getWorkspaceChannels(workspaceId: string): Promise<any> {
    const res = await privateApi.get<any>(`/channels/${workspaceId}`);
    return res.data.data;
  },
};
