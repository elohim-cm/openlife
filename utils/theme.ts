import {
  THEMES,
  type Theme,
} from "@/types/theme";

export const THEME_STORAGE_KEY = "openlife-theme";

export const THEME_COOKIE_NAME = "openlife-theme";

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === "string" &&
    THEMES.includes(value as Theme)
  );
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedTheme = window.localStorage.getItem(
      THEME_STORAGE_KEY,
    );

    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}