import { UserId } from "@/features/auth/store/use-auth-store";
import { User } from "@/features/user/types/api";
import { privateApi } from "@/lib/api";

export const userService = {
  async getUserProfile(userId: UserId): Promise<User> {
    const res = await privateApi.get<User>(`/user/${userId}/profile`);
    return res.data;
  },
};
