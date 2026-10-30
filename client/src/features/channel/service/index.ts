import { privateApi } from "@/lib/api";
import { ChannelListResponse, CreateChannelRequestDTO } from "@/features/channel/types/api";
import { APIResponse } from "@/types";

export const channelService = {
  async getWorkspaceChannels(workspaceId: string): Promise<ChannelListResponse> {
    const res = await privateApi.get<ChannelListResponse>(`/workspaces/${workspaceId}/channels`);
    return res.data;
  },

  async createWorkspaceChannel(data: CreateChannelRequestDTO, workspaceId: string) {
    const res = await privateApi.post<APIResponse<string>>(`/workspaces/${workspaceId}/channels`, data)

    return res.data
  }
};
