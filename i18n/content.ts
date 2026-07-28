import { en } from "@/i18n/locales/en";
import { fr } from "@/i18n/locales/fr";
import type {
  Locale,
} from "@/types/i18n";

export const SITE_CONTENT = {fr,en,} as const;

export type SiteContent =(typeof SITE_CONTENT)[Locale];

export function getSiteContent(locale: Locale,): SiteContent {
  return SITE_CONTENT[locale];
}