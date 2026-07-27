export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};