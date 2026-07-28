import type {Locale} from "@/types/i18n";
import {isLocale} from "@/types/i18n";

export const DEFAULT_LOCALE:Locale = "fr";

export const LOCALE_STORAGE_KEY ="openlife-locale";

export function getOppositeLocale(locale: Locale,): Locale {
  return locale === "fr"? "en": "fr";
}

export function getStoredLocale():Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedLocale =window.localStorage.getItem(LOCALE_STORAGE_KEY,);
    return isLocale(storedLocale)? storedLocale: null;
  } catch {return null;
  }
}

export function storeLocale(locale: Locale,): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY,locale,
    );
  } catch {
    /* Le changement de langue reste fonctionnel pour la session même si le stockage est indisponible.*/
  }
}