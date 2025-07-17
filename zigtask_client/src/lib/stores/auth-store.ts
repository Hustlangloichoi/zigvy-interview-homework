import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, createAuthHeaders, handleApiResponse } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(api.auth.login, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await handleApiResponse(response);
          const { accessToken } = data;

          // Decode JWT to get user info
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          const user = {
            id: payload.sub,
            email: payload.email,
          };

          set({
            user: user,
            token: accessToken,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(api.auth.signup, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await handleApiResponse(response);
          const { accessToken } = data;

          // Decode JWT to get user info
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          const user = {
            id: payload.sub,
            email: payload.email,
            name: name, // Use the name from signup form
          };

          set({
            user: user,
            token: accessToken,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Signup failed";
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await fetch(api.auth.logout, {
              method: "POST",
              headers: createAuthHeaders(token),
            });
          } catch {
            // Silently fail logout request to backend
          }
        }
        set({ user: null, token: null, error: null });
      },

      setUser: (user) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
