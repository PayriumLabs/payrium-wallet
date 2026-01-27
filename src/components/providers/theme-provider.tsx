"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Forcing Light Theme as primary/only theme for now
type Theme = "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always state "light"
  const theme: Theme = "light";
  
  useEffect(() => {
    // Force document class to light on mount, just in case
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  }, []);

  const setTheme = () => {
    // No-op: Theme switching is disabled for this phase
    console.log("Theme switching disabled: Enforcing Premium White Theme");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return {
    theme: "light",
    setTheme: () => {},
    resolvedTheme: "light"
  };
}
