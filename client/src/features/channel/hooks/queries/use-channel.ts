import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { channelService } from "@/features/channel/service";


export function useWorkspaceChannels(workspaceId: string) {
  return useSuspenseQuery({
    queryKey: ["workspace-channels", workspaceId],
    queryFn: () => channelService.getWorkspaceChannels(workspaceId),
    // enabled: !!workspaceId
  });
}