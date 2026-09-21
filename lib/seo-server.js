import { headers } from 'next/headers';
import { WEB_URL } from "@/utils/api/api";

export function generateServerSideBaseUrl() {
  const host = headers().get('host') || WEB_URL;
  const protocol = 'https';
  return `${protocol}://${host}`;
}

export function generateServerAlternateLinks(pathname = '/') {
  const baseUrl = generateServerSideBaseUrl();
  
  const languages = [
    { code: 'fr', name: 'Français', default: true },
    { code: 'en', name: 'English' }
  ];

  return languages.map(lang => ({
    rel: 'alternate',
    hrefLang: lang.code,
    href: `${baseUrl}${lang.code === 'fr' ? pathname : `/${lang.code}${pathname}`}`,
    title: lang.name
  }));
}

export function generateServerHreflangTags(pathname = '/') {
  const baseUrl = generateServerSideBaseUrl();
  
  const languages = [
    { code: 'fr', default: true },
    { code: 'en' }
  ];

  return languages.map(lang => ({
    rel: 'alternate',
    hrefLang: lang.code,
    href: `${baseUrl}${lang.code === 'fr' ? pathname : `/${lang.code}${pathname}`}`
  }));
}

export function generateServerCanonicalUrl(pathname = '/', lang = 'fr') {
  const baseUrl = generateServerSideBaseUrl();
  return `${baseUrl}${lang === 'fr' ? pathname : `/${lang}${pathname}`}`;
}
