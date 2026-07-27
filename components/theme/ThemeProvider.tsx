"use client";

import {
  type PropsWithChildren,
  useCallback,
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
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
} from "@/utils/theme";

type ThemeProviderProps =
  PropsWithChildren<{
    initialTheme: Theme;
  }>;

export function ThemeProvider({
  initialTheme,
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] =
    useState<Theme>(
      initialTheme,
    );

  const persistTheme =
    useCallback(
      (
        nextTheme: Theme,
      ): void => {
        applyTheme(nextTheme);

        document.cookie = [
          `${THEME_COOKIE_NAME}=${nextTheme}`,
          "Path=/",
          `Max-Age=${THEME_COOKIE_MAX_AGE}`,
          "SameSite=Lax",
        ].join("; ");

        try {
          window.localStorage.setItem(
            THEME_STORAGE_KEY,
            nextTheme,
          );
        } catch {
          /*
           * Le cookie et le thème visuel
           * restent fonctionnels.
           */
        }
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
        (currentTheme) => {
          const nextTheme:
            Theme =
            currentTheme === "dark"
              ? "light"
              : "dark";

          persistTheme(nextTheme);

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