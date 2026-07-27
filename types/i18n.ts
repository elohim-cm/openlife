export const SUPPORTED_LOCALES = [
  "fr",
  "en",
] as const;

export type Locale =
  (typeof SUPPORTED_LOCALES)[number];

export type LocaleContextValue = {
  locale: Locale;
  changeLocale: (
    locale: Locale,
  ) => Promise<void>;
  toggleLocale: () => Promise<void>;
};

export function isLocale(
  value: unknown,
): value is Locale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(
      value as Locale,
    )
  );
}