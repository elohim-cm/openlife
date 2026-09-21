import { WEB_URL } from "@/utils/api/api";

export function generateAlternateLinks(pathname = '/', lang = 'fr') {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : WEB_URL;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  
  const languages = [
    { code: 'fr', name: 'Français', default: true },
    { code: 'en', name: 'English' }
  ];

  return languages.map(langItem => ({
    rel: 'alternate',
    hrefLang: langItem.code,
    href: `${normalizedBaseUrl}${langItem.code === 'fr' ? pathname : `/${langItem.code}${pathname}`}`,
    title: langItem.name
  }));
}

export function generateHreflangTags(pathname = '/', lang = 'fr') {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : WEB_URL;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  
  const languages = [
    { code: 'fr', default: true },
    { code: 'en' }
  ];

  return languages.map(langItem => ({
    rel: 'alternate',
    hrefLang: langItem.code,
    href: `${normalizedBaseUrl}${langItem.code === 'fr' ? pathname : `/${langItem.code}${pathname}`}`
  }));
}

export function generateCanonicalUrl(pathname = '/', lang = 'fr') {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : WEB_URL;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  
  return `${normalizedBaseUrl}${lang === 'fr' ? pathname : `/${lang}${pathname}`}`;
}
