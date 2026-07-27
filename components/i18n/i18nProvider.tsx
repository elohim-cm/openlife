"use client";

import {createInstance,} from "i18next";
import {I18nextProvider,initReactI18next,} from "react-i18next";
import { type PropsWithChildren,useCallback,useMemo,useState,} from "react";

import {LocaleContext,} from "@/contexts/LocaleContext";
import {getSiteContent,} from "@/i18n/content";
import {getOppositeLocale,LOCALE_COOKIE_MAX_AGE,LOCALE_COOKIE_NAME,} from "@/i18n/config";
import {I18N_RESOURCES,} from "@/i18n/resources";
import type {Locale,} from "@/types/i18n";

type I18nProviderProps = PropsWithChildren<{initialLocale: Locale;}>;

function updateDocumentMetadata(locale: Locale,): void {
  const content = getSiteContent(locale);

  document.title = content.metadata.title;

  const descriptionElement =document.querySelector<HTMLMetaElement>('meta[name="description"]',);

  if (descriptionElement) {descriptionElement.content =content.metadata.description;}

  const openGraphTitle =document.querySelector<HTMLMetaElement>('meta[property="og:title"]',);

  if (openGraphTitle) {openGraphTitle.content =content.metadata.title;}

  const openGraphDescription =document.querySelector<HTMLMetaElement>('meta[property="og:description"]',);

  if (openGraphDescription) {openGraphDescription.content =content.metadata.description;}
}

export function I18nProvider({initialLocale,children,}: I18nProviderProps) {
  const [locale, setLocale] =
    useState<Locale>(
      initialLocale,
    );

  const [i18nInstance] = useState(() => {const instance = createInstance();

      void instance .use(initReactI18next) .init({
          resources:I18N_RESOURCES,
          lng: initialLocale,
          fallbackLng: "fr",
          supportedLngs: [
            "fr",
            "en",
          ],
          defaultNS:"translation",
          interpolation: {escapeValue: false,},
          react: {useSuspense: false,},
          initImmediate: false,
        });

      return instance;
    });

  const changeLocale = useCallback( async (nextLocale: Locale,): Promise<void> => {
        if (nextLocale === locale) {return;}

        await i18nInstance .changeLanguage(nextLocale,);

        setLocale(nextLocale);

        document.documentElement.lang =nextLocale;

        document.documentElement.dataset.locale =nextLocale;

        document.documentElement.dir = "ltr";

        updateDocumentMetadata(nextLocale,);

        document.cookie = [
          `${LOCALE_COOKIE_NAME}=${nextLocale}`,
          "Path=/",
          `Max-Age=${LOCALE_COOKIE_MAX_AGE}`,
          "SameSite=Lax",
        ].join("; ");
      },
      [i18nInstance,locale,],
    );

  const toggleLocale = useCallback(async (): Promise<void> => {
        await changeLocale(getOppositeLocale(locale,),);
      },
      [
        changeLocale,
        locale,
      ],
    );

  const contextValue = useMemo(() => ({
        locale,
        changeLocale,
        toggleLocale,
      }),
      [
        changeLocale,
        locale,
        toggleLocale,
      ],
    );

  return (
    <I18nextProvider i18n={i18nInstance}>
      <LocaleContext.Provider value={contextValue}>
        {children}
      </LocaleContext.Provider>
    </I18nextProvider>
  );
}