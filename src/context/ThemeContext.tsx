"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Theme } from "@/types";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default: light (white). Users can switch to dark/system in Settings.
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("sirbax-theme") as Theme | null;
    // Only apply stored preference if user explicitly chose one
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    } else {
      // Force light for first-time / no preference
      localStorage.setItem("sirbax-theme", "light");
      setThemeState("light");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const isDark =
        theme === "dark" || (theme === "system" && media.matches);
      setResolvedTheme(isDark ? "dark" : "light");
      root.classList.toggle("dark", isDark);
      // Ensure no dark class when light
      if (!isDark) root.classList.remove("dark");
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("sirbax-theme", t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
