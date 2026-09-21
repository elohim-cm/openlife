"use client";

import { useThemeMode } from "@/contexts/themeModeContext";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggle({ className = "" }) {
  const { mode, toggleMode } = useThemeMode();

  return (
    <IconButton
      onClick={toggleMode}
      className={`theme-toggle-btn ${className}`}
      aria-label={mode === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
      sx={{ ml: 1 }}
    >
      {mode === "light" ? (
        <DarkModeIcon className="theme-toggle-icon" />
      ) : (
        <LightModeIcon className="theme-toggle-icon" />
      )}
    </IconButton>
  );
}
