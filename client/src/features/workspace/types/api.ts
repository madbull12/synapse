import { APIResponse } from "@/types";

export type CreateWorkspaceDTO = {
  name: string;
  logoURL?: string;
  slug: string;
};

export type WorkspaceDTO = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  owner_id: string;
  users: {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  }[];
  created_at: string;
  updated_at: string;
};

export type WorkspaceResponse = APIResponse<WorkspaceDTO[]>;
