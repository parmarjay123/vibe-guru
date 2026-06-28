"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType = "indigo" | "orange" | "emerald" | "purple" | "amber";

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("indigo");
  const [isDark, setIsDarkState] = useState<boolean>(true);

  useEffect(() => {
    // Load preference from localStorage
    const savedTheme = localStorage.getItem("vibeguru-theme") as ThemeType;
    const savedDark = localStorage.getItem("vibeguru-dark");

    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (savedDark !== null) {
      setIsDarkState(savedDark === "true");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkState(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply classes to root html element
    const root = document.documentElement;
    
    // Remove existing themes
    root.classList.remove("theme-indigo", "theme-orange", "theme-emerald", "theme-purple", "theme-amber");
    root.classList.add(`theme-${theme}`);

    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Save preference
    localStorage.setItem("vibeguru-theme", theme);
    localStorage.setItem("vibeguru-dark", String(isDark));
  }, [theme, isDark]);

  const setTheme = (t: ThemeType) => setThemeState(t);
  const setIsDark = (d: boolean) => setIsDarkState(d);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
