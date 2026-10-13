import { UserDTO } from "@/features/user/types/api";
import { APIResponse } from "@/types";

export type CreateWorkspaceDTO = {
  name: string;
  logoURL?: string;
  slug: string;
};
export interface InvitationDetails {
  email: string;
  workspace_name: string;
  role: string;
  is_existing_user: boolean;
}

export type VerifyInvitationResponse = APIResponse<InvitationDetails>;


export interface AcceptInvitationDTO {
  token: string;
  name?: string;
  password?: string;
}
export interface SendInvitationDTO {
  email: string;
  role: string;
}

export type AddMemberToWorkspaceDTO = {
  email: string;
  role: string;
  workspaceId: string;
};

export type WorkspaceMember = {
  workspace_id: string
  user_id: string
  role: string
  joined_at: string
  user: UserDTO
}

export type WorkspaceDTO = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  owner_id: string;
  owner: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  }
  members: WorkspaceMember[];
  created_at: string;
  updated_at: string;
};

export type WorkspaceByIdDto = {
  created_at: string;
  id: string;
  logo_url: string;
  name: string;
  owner_id: string;
  slug: string;
  updated_at: string;
};

export type WorkspaceByIdResponse = APIResponse<WorkspaceDTO>;

export type WorkspaceResponse = APIResponse<WorkspaceDTO[]>;
