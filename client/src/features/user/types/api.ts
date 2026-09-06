import { APIResponse } from "@/types";

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}
export type AuthResponse = APIResponse<User>;
