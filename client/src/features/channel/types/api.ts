import { UserDTO } from "@/features/user/types/api";
import { WorkspaceDTO } from "@/features/workspace/types/api";
import { APIResponse } from "@/types";

export interface ChannelDTO {
    id: string;
    name: string;
    topic: string;
    type: "PUBLIC" | "PRIVATE";
    workspace_id: string;
    workspace: WorkspaceDTO;
    creator_id: string;
    creator: UserDTO;
    members: UserDTO[];
    created_at: string;
    updated_at: string;
}

export type ChannelListResponse = APIResponse<ChannelDTO[]>;

export type CreateChannelRequestDTO = {
    name: string
    topic: string
    type: "PUBLIC" | "PRIVATE"
}