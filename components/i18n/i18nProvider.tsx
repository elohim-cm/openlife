"use client";

import {createInstance,} from "i18next";
import {I18nextProvider,initReactI18next,} from "react-i18next";
import {type PropsWithChildren,useCallback,useEffect,useMemo,useState,} from "react";

import {LocaleContext,} from "@/contexts/LocaleContext";
import {DEFAULT_LOCALE,getOppositeLocale,getStoredLocale,storeLocale,} from "@/i18n/config";
import {getSiteContent,} from "@/i18n/content";
import {I18N_RESOURCES,} from "@/i18n/resources";
import type {Locale,} from "@/types/i18n";

type I18nProviderProps =PropsWithChildren;

function updateMetaContent(selector: string,content: string,): void {
  const element =document.querySelector<HTMLMetaElement>(selector,);
  if (element) {element.content = content;}
}

function applyLocaleToDocument(locale: Locale,): void {
  const localizedContent =getSiteContent(locale);

  const root =document.documentElement;

  root.lang = locale;
  root.dataset.locale =locale;

  document.title =localizedContent.metadata.title;

  updateMetaContent(
    'meta[name="description"]',localizedContent.metadata.description,
  );

  updateMetaContent(
    'meta[property="og:title"]',localizedContent.metadata.title,
  );

  updateMetaContent(
    'meta[property="og:description"]',localizedContent.metadata.description,
  );
}

export function I18nProvider({children,}: I18nProviderProps) {
  const [locale, setLocale] =useState<Locale>(DEFAULT_LOCALE,);

  const [i18nInstance] =useState(() => {
      const instance =createInstance();

      void instance.use(initReactI18next).init({
          resources:I18N_RESOURCES,

          lng: DEFAULT_LOCALE,

          fallbackLng:DEFAULT_LOCALE,

          supportedLngs: ["fr","en",],

          defaultNS:"translation",

          interpolation: {escapeValue: false,},

          react: {useSuspense: false,},

          initImmediate: false,
        }as any);

      return instance;
    });

  const applyLocale =useCallback(
      async (nextLocale: Locale,persist: boolean,): Promise<void> => {
        await i18nInstance.changeLanguage(nextLocale,);

        setLocale(nextLocale);

        applyLocaleToDocument(nextLocale,);

        if (persist) {storeLocale(nextLocale,);}
      },[i18nInstance],
    );

  useEffect(() => {
    const storedLocale =getStoredLocale();

    const resolvedLocale =storedLocale ??DEFAULT_LOCALE;

    void applyLocale(resolvedLocale,!storedLocale,);
  }, [applyLocale]);

  const changeLocale =useCallback(
      async (nextLocale: Locale,): Promise<void> => {
        if (nextLocale === locale) {
          return;
        }

        await applyLocale(nextLocale,true,);
      },
      [applyLocale,locale,],
    );

  const toggleLocale =
    useCallback(
      async (): Promise<void> => {
        await changeLocale(getOppositeLocale(locale,),
        );
      },
      [changeLocale,locale,],
    );

  const contextValue =useMemo(() => 
    ({locale,changeLocale,toggleLocale,}),
    [changeLocale,locale,toggleLocale,],
  );

  return (
    <I18nextProvider i18n={i18nInstance}>
      <LocaleContext.Provider value={contextValue}>
        {children}
      </LocaleContext.Provider>
    </I18nextProvider>
  );
}