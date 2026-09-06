import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserId = string | null;

interface AuthState {
  accessToken: string | null;
  userId: UserId;
  isAuthenticated: boolean;

  // Actions
  setAccessToken: (token: string | null) => void;
  setAuth: (userId: UserId, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      isAuthenticated: false,

      setAccessToken: (token) =>
        set({
          accessToken: token,
          isAuthenticated: Boolean(token),
        }),

      setAuth: (userId, accessToken) =>
        set({
          userId,
          accessToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          accessToken: null,
          userId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage), // Defaults to localStorage
    },
  ),
);
