"use client";

import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ThemeContext,
} from "@/contexts/ThemeContext";
import type {
  Theme,
} from "@/types/theme";
import {
  applyTheme,
  DEFAULT_THEME,
  getStoredTheme,
  getSystemTheme,
  storeTheme,
} from "@/utils/theme";

type ThemeProviderProps =
  PropsWithChildren;

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] =
    useState<Theme>(
      DEFAULT_THEME,
    );

  useEffect(() => {
    const storedTheme =
      getStoredTheme();

    const resolvedTheme =
      storedTheme ??
      getSystemTheme();

    setThemeState(
      resolvedTheme,
    );

    applyTheme(
      resolvedTheme,
    );

    /* Si aucune préférence n’existait, on enregistre le thème système.*/
    if (!storedTheme) {
      storeTheme(
        resolvedTheme,
      );
    }
  }, []);

  const persistTheme =
    useCallback(
      (
        nextTheme: Theme,
      ): void => {
        applyTheme(nextTheme);
        storeTheme(nextTheme);
      },
      [],
    );

  const setTheme =
    useCallback(
      (
        nextTheme: Theme,
      ): void => {
        setThemeState(nextTheme);
        persistTheme(nextTheme);
      },
      [persistTheme],
    );

  const toggleTheme =
    useCallback((): void => {
      setThemeState(
        (
          currentTheme,
        ) => {
          const nextTheme:
            Theme =
              currentTheme ===
              "dark"
                ? "light"
                : "dark";

          persistTheme(
            nextTheme,
          );

          return nextTheme;
        },
      );
    }, [persistTheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark:
        theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [
      setTheme,
      theme,
      toggleTheme,
    ],
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}