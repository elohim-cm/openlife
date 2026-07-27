"use client";

import { createContext } from "react";

import type {
  LocaleContextValue,
} from "@/types/i18n";

export const LocaleContext =
  createContext<
    LocaleContextValue | null
  >(null);