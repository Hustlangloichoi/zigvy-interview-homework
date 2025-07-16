import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") return getSystemTheme();
  return theme;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",

      setTheme: (theme: Theme) => {
        const resolved = resolveTheme(theme);
        set({ theme, resolvedTheme: resolved });

        // Apply theme to document
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(resolved);

          // Update meta theme-color
          const metaThemeColor = document.querySelector(
            'meta[name="theme-color"]'
          );
          if (metaThemeColor) {
            metaThemeColor.setAttribute(
              "content",
              resolved === "dark" ? "#0f172a" : "#ffffff"
            );
          }
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme =
          theme === "light" ? "dark" : theme === "dark" ? "light" : "light";
        get().setTheme(newTheme);
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Initialize theme on client side
if (typeof window !== "undefined") {
  const store = useThemeStore.getState();

  // Listen for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    if (store.theme === "system") {
      store.setTheme("system");
    }
  };

  mediaQuery.addEventListener("change", handleChange);

  // Set initial theme
  store.setTheme(store.theme);
}
