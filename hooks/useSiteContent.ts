"use client";

import { useMemo } from "react";

import {
  getSiteContent,
  type SiteContent,
} from "@/i18n/content";
import {
  useLocale,
} from "@/hooks/useLocale";

export function useSiteContent():
  SiteContent {
  const { locale } =
    useLocale();

  return useMemo(
    () =>
      getSiteContent(
        locale,
      ),
    [locale],
  );
}