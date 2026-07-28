"use client";

import {
  FaMoon,
  FaSun,
} from "react-icons/fa";

import {
  useSiteContent,
} from "@/hooks/useSiteContent";
import {
  useTheme,
} from "@/hooks/useTheme";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({
  className = "",
}: ThemeToggleProps) {
  const {
    isDark,
    toggleTheme,
  } = useTheme();

  const content =
    useSiteContent();

  const label = isDark
    ? content.accessibility.lightTheme
    : content.accessibility.darkTheme;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      onClick={toggleTheme}
      data-theme-transition
      className={`
        relative flex size-9
        shrink-0 items-center
        justify-center
        overflow-hidden
        rounded-full
        text-icon
        transition-colors
        duration-300
        hover:bg-brand-soft
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-focus
        focus-visible:ring-offset-2
        focus-visible:ring-offset-surface
        ${className}
      `}
    >
      <span
        className={`
          absolute
          transition-all
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }
        `}
      >
        <FaMoon
          aria-hidden="true"
          className="size-[17px]"
        />
      </span>

      <span
        className={`
          absolute
          transition-all
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }
        `}
      >
        <FaSun
          aria-hidden="true"
          className="size-[18px]"
        />
      </span>
    </button>
  );
}