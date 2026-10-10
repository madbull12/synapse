import { UserId } from "@/features/auth/store/use-auth-store";
import { UserDTO, UserResponse } from "@/features/user/types/api";
import { privateApi } from "@/lib/api";

export const userService = {
  async getUserProfile(userId: UserId): Promise<UserDTO> {
    const res = await privateApi.get<UserResponse>(`/user/${userId}/profile`);
    return res.data.data;
  },
};
