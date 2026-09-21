import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

const isBrowser = typeof window !== 'undefined';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

i18n
  // HTTP backend: only meaningful if we provide a valid absolute URL on server
  .use(Backend)
  // Detect language in the browser
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
    backend: {
      // On the client, a relative path works. On the server, we must use absolute URL.
      loadPath: isBrowser
        ? '/locales/{{lng}}/{{ns}}.json'
        : `${appUrl}/locales/{{lng}}/{{ns}}.json`,
    },
    // Ensure SSR behaves deterministically
    initImmediate: false,
    // Default namespace configuration
    ns: ['translation'],
    defaultNS: 'translation',
  });

export default i18n;
