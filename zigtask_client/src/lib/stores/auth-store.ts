import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

// Mock API functions - replace with real API calls
const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation
  if (email === "demo@example.com" && password === "password") {
    return {
      user: { id: "1", email, name: "Demo User" },
      token: "mock-jwt-token",
    };
  }

  throw new Error("Invalid credentials");
};

const mockSignup = async (name: string, email: string, password: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    user: { id: Date.now().toString(), email, name },
    token: "mock-jwt-token",
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        const { user, token } = await mockLogin(email, password);
        set({ user, token });
      },
      signup: async (name, email, password) => {
        const { user, token } = await mockSignup(name, email, password);
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
      },
      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
