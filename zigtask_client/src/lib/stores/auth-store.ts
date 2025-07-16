import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Mock API functions - replace with actual API calls
const mockLogin = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

  if (email === "demo@example.com" && password === "password") {
    return {
      user: {
        _id: "1",
        email,
        createdAt: new Date().toISOString(),
      },
      token: "mock-jwt-token",
    };
  }
  throw new Error("Invalid credentials");
};

const mockSignup = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

  return {
    user: {
      _id: Math.random().toString(36).substr(2, 9),
      email,
      createdAt: new Date().toISOString(),
    },
    token: "mock-jwt-token",
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { user, token } = await mockLogin(email, password);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      signup: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { user, token } = await mockSignup(email, password);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Signup failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
