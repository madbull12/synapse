import { useSuspenseQuery } from "@tanstack/react-query";
import { channelService } from "@/features/channel/service";
import { ChannelListResponse } from "@/features/channel/types/api";
import { AxiosError } from "axios";
import { APIError } from "@/types";

export function useWorkspaceChannels(workspaceId: string) {
  return useSuspenseQuery<ChannelListResponse, AxiosError<APIError>>({
    queryKey: ["workspace-channels", workspaceId],
    queryFn: () => channelService.getWorkspaceChannels(workspaceId),
    // enabled: !!workspaceId
  });
}