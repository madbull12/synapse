import { APIError } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { channelService } from "@/features/channel/service";

export const useWorkspaceChannels = (workspaceId: string) => {
  return useQuery<any, AxiosError<APIError>>({
    queryKey: ["workspaces", workspaceId],
    queryFn: () => channelService.getWorkspaceChannels(workspaceId),
    enabled: !!workspaceId,
  });
};
