import { privateApi } from "@/lib/api";
import { ChannelListResponse, CreateChannelRequestDTO } from "@/features/channel/types/api";
import { APIResponse } from "@/types";

export const channelService = {
  async getWorkspaceChannels(workspaceId: string): Promise<ChannelListResponse> {
    const res = await privateApi.get<ChannelListResponse>(`/channels/${workspaceId}`);
    return res.data;
  },

  async createWorkspaceChannel(data: CreateChannelRequestDTO, workspaceId: string) {
    const res = await privateApi.post<APIResponse<string>>(`/channels/${workspaceId}`, data)

    return res.data
  }
};
