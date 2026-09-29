import { APIResponse } from "@/types";

export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}
export type UserResponse = APIResponse<UserDTO>;
