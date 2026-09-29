import { APIError, APIResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CreateChannelRequestDTO } from "@/features/channel/types/api";
import { channelService } from "@/features/channel/service";
import { toast } from "sonner";

export const useCreateChannel = (workspaceId: string) => {
    const queryClient = useQueryClient();
    return useMutation<
        APIResponse<string>,
        AxiosError<APIError>,
        CreateChannelRequestDTO
    >({
        mutationFn: (data) => channelService.createWorkspaceChannel(data, workspaceId),
        onSuccess: (data) => {
            toast.success(data.message || "Channel created successfully!");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace-channels", workspaceId] });
        },
    });
}