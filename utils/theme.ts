import {THEMES,type Theme} from "@/types/theme";

export const DEFAULT_THEME:Theme = "light";
export const THEME_STORAGE_KEY ="openlife-theme";

export function isTheme(value: unknown,): value is Theme {
  return (
    typeof value === "string" && THEMES.includes(
      value as Theme,
    )
  );
}

export function getSystemTheme():Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  return window.matchMedia("(prefers-color-scheme: dark)",).matches? "dark": "light";
}

export function getStoredTheme():Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedTheme =window.localStorage.getItem(THEME_STORAGE_KEY,);
    return isTheme(storedTheme)? storedTheme: null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme,): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY,theme,
    );
  } catch {
    /* Le thème continue de fonctionner pendant la session courante.*/
  }
}

export function applyTheme(
  theme: Theme,
): void {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  const root =document.documentElement;

  root.classList.toggle(
    "dark",
    theme === "dark",
  );

  root.classList.toggle(
    "scheme-dark",
    theme === "dark",
  );

  root.classList.toggle(
    "scheme-light",
    theme === "light",
  );

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}