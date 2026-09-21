"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("theme-mode") : null;
    if (saved === "dark" || saved === "light") {
      setMode(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialMode = prefersDark ? 'dark' : 'light';
      setMode(initialMode);
      document.documentElement.setAttribute('data-theme', initialMode);
      localStorage.setItem('theme-mode', initialMode);
    }
  }, []);

  const toggleMode = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme-mode", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeModeContext);
