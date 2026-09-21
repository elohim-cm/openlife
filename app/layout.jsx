"use client";

import {useEffect, useState} from "react";
import ThemeWrapper from "@/components/mui-theme/ThemeWrapper";

// styles
// import '/styles/globals.scss'
import "@/styles/helpers.scss";
import "@/styles/flex.scss";
import {MaterialUIControllerProvider} from "@/material/context";
import {SnackbarProvider} from "notistack";
import "@/styles/globals.scss";
import "@/i18n";
import i18n from "@/i18n";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";
import TokenRefreshManager from "@/components/TokenRefreshManager";
import SessionManager from "@/components/SessionManager";
import { ThemeModeProvider } from "@/contexts/themeModeContext";

import { generateHreflangTags, generateCanonicalUrl } from "@/lib/seo";

export default function RootLayout({children}) {
  const [ready, setReady] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');

  useEffect(() => {
    setReady(true);
    const supported = ['fr', 'en'];

    const detected = (() => {
      try {
        const stored = window.localStorage.getItem('i18nextLng');
        if (stored) {
          const normalized = stored.split('-')[0];
          if (supported.includes(normalized)) return normalized;
        }
      } catch (e) {
        // ignore
      }

      const browserLang = navigator.language?.split('-')[0];
      return supported.includes(browserLang) ? browserLang : 'fr';
    })();

    if (i18n.language !== detected) {
      i18n.changeLanguage(detected);
    }

    setCurrentLang(detected);
  }, []);

  useEffect(() => {
    const handler = lng => {
      const normalized = (lng || 'fr').split('-')[0];
      setCurrentLang(normalized);
    };

    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []);

  // Générer les balises hreflang
  const hreflangTags = generateHreflangTags('/', currentLang);
  const canonicalUrl = generateCanonicalUrl('/', currentLang);
  const optimizedTitle = currentLang === 'fr'
    ? 'Open Life | Épargne journalière digitale au Cameroun'
    : 'Open Life | Digital daily savings in Cameroon';
  const optimizedDescription = currentLang === 'fr'
    ? 'Épargnez dès 200 FCFA par jour avec Open Life, la solution digitale d’ACAM Vie pour constituer votre capital simplement depuis votre téléphone.'
    : 'Save from 200 FCFA per day with Open Life, ACAM Vie’s digital solution for building your savings easily from your phone.';

  return (
    <html lang={currentLang}>
      <head>
        <title>{optimizedTitle}</title>
        <meta name="description" content={optimizedDescription} />
        <meta name="application-name" content="Open Life" />
        <meta name="subject" content={currentLang === 'fr' ? "Épargne journalière digitale au Cameroun" : "Digital daily savings in Cameroon"} />
        <meta name="classification" content="Finance, Épargne, Assurance vie" />
        <meta name="coverage" content="Cameroon" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="format-detection" content="telephone=yes" />

        {/* SEO International */}
        <link rel="canonical" href={canonicalUrl} />
        {hreflangTags.map((tag, index) => (
          <link key={index} rel="alternate" hrefLang={tag.hrefLang} href={tag.href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

        {/* Favicon */}
        <link rel="icon" href="/favicon-32x32.png" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0d6732" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Open Life" />
        <meta property="og:title" content={optimizedTitle} />
        <meta property="og:description" content={optimizedDescription} />
        <meta property="og:image" content="/android-chrome-512x512.png" />
        <meta property="og:image:secure_url" content="/android-chrome-512x512.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="Logo officiel Open Life par ACAM Vie" />
        <meta property="og:locale" content={currentLang === 'fr' ? 'fr_CM' : 'en_CM'} />
        <meta property="og:locale:alternate" content={currentLang === 'fr' ? 'en_CM' : 'fr_CM'} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={optimizedTitle} />
        <meta property="twitter:description" content={optimizedDescription} />
        <meta property="twitter:image" content="/android-chrome-512x512.png" />
        <meta property="twitter:image:alt" content="Logo officiel Open Life par ACAM Vie" />
        <meta name="twitter:site" content="@OpenLif24397584" />
        <meta name="twitter:creator" content="@OpenLif24397584" />

        {/* SEO additionnel */}
        <meta name="keywords" content="épargne, épargne journalière, épargne digitale, OpenLife, ACAM Vie, assurance vie, investissement, Cameroun, Afrique" />
        <meta name="author" content="ACAM Vie" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="googlebot-news" content="index, follow" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Géolocalisation */}
        <meta name="geo.region" content="CM" />
        <meta name="geo.placename" content="Cameroun" />
        <meta name="geo.position" content="3.8480;11.5021" />
        <meta name="ICBM" content="3.8480,11.5021" />

        {/* Langue et région */}
        <meta name="content-language" content={currentLang} />
        <meta name="language" content={currentLang === 'fr' ? 'Français' : 'English'} />

        {/* Fichiers SEO additionnels */}
        <link rel="search" type="application/opensearchdescription+xml" title="OpenLife" href="/opensearch.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="author" href="/humans.txt" />
        <link rel="home" href={canonicalUrl} />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* Performance */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        <link rel="preload" href="/android-chrome-192x192.png" as="image" type="image/png" />

        {/* Verification */}
        <meta name="google-site-verification" content="your-google-verification-code" />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
        <meta name="yandex-verification" content="your-yandex-verification-code" />
      </head>
      <body>
        <main>
          <ThemeModeProvider>
            <ThemeWrapper>
              <MaterialUIControllerProvider>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <SnackbarProvider>
                    <TokenRefreshManager />
                    <SessionManager />
                    {ready ? children : null}
                  </SnackbarProvider>
                </LocalizationProvider>
              </MaterialUIControllerProvider>
            </ThemeWrapper>
          </ThemeModeProvider>
        </main>
      </body>
    </html>
  );
}
