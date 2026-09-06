import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useMutation } from "@tanstack/react-query";
import { AuthResponse, LoginDTO, RegisterDTO } from "@/features/auth/types/api";
import { AxiosError } from "axios";
import { authService } from "@/features/auth/service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { APIError } from "@/types";
export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, AxiosError<APIError>, LoginDTO>({
    mutationFn: (credentials: LoginDTO) => authService.login(credentials),

    onSuccess: (data) => {
      if (!data.data) return;
      setAuth(data.data?.user_id, data.data?.access_token);

      router.push("/workspace");
    },
  });
};
export const useRegister = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, AxiosError<APIError>, RegisterDTO>({
    mutationFn: (credentials) => authService.register(credentials),

    onSuccess: (data) => {
      toast.success("Registration successful! Please log in.");
      if (!data.data) return;
      setAuth(data.data.user_id, data.data.access_token);

      router.push("/auth/login");
    },

    onError: (error) => {},
  });
};

export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  return useMutation<void, AxiosError<APIError>, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      router.push("/auth/login");
    },
  });
};
