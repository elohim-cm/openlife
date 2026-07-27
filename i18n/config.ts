import type { Locale } from "@/types/i18n";

export const DEFAULT_LOCALE:
  Locale = "fr";

export const LOCALE_COOKIE_NAME =
  "openlife-locale";

export const LOCALE_COOKIE_MAX_AGE =
  60 * 60 * 24 * 365;

export function getOppositeLocale(
  locale: Locale,
): Locale {
  return locale === "fr"
    ? "en"
    : "fr";
}