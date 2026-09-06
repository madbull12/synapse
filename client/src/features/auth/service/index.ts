import { privateApi, publicApi } from "@/lib/api";
import { AuthResponse, LoginDTO, RegisterDTO } from "@/features/auth/types/api";

export const authService = {
  async register(data: RegisterDTO) {
    const res = await publicApi.post<AuthResponse>("/auth/register", data);
    return res.data;
  },
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const res = await publicApi.post<AuthResponse>("/auth/login", credentials);
    return res.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const res = await publicApi.post<AuthResponse>("/auth/refresh");
    return res.data;
  },

  async logout(): Promise<void> {
    await privateApi.post("/auth/logout");
  },
};
