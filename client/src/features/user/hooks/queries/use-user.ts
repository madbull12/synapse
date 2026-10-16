import { AxiosError } from "axios";
import { APIError } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { UserDTO } from "@/features/user/types/api";
import { userService } from "@/features/user/service";
import { UserId } from "@/features/auth/store/use-auth-store";

export const useUserProfile = (userId: UserId) => {
  return useQuery<UserDTO, AxiosError<APIError>>({
    queryKey: ["user", userId],
    queryFn: async () => userService.getUserProfile(userId),
    enabled: !!userId, // Only run the query if userId is provided
  });
};
