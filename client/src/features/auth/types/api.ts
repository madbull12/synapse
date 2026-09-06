import { APIResponse } from "@/types";

export interface AuthData {
  access_token: string;
  user_id: string;
}

export type AuthResponse = APIResponse<AuthData>;

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
