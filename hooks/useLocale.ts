"use client";

import { useContext } from "react";

import {
  LocaleContext,
} from "@/contexts/LocaleContext";
import type {
  LocaleContextValue,
} from "@/types/i18n";

export function useLocale():
  LocaleContextValue {
  const context =
    useContext(LocaleContext);

  if (!context) {
    throw new Error(
      "useLocale doit être utilisé à l’intérieur de I18nProvider.",
    );
  }

  return context;
}