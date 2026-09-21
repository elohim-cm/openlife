// SEO utilities for international optimization

import { WEB_URL } from "@/utils/api/api";

export const generateStructuredData = (type, data, lang = 'fr') => {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : WEB_URL;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  
  switch (type) {
    case 'website':
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${normalizedBaseUrl}/#website`,
        "url": normalizedBaseUrl,
        "name": "Open Life",
        "alternateName": "OpenLife by ACAM Vie",
        "description": lang === 'fr'
          ? "Solution digitale d'épargne journalière proposée par ACAM Vie au Cameroun"
          : "Digital daily savings solution provided by ACAM Vie in Cameroon",
        "inLanguage": ["fr-CM", "en-CM"],
        "publisher": {"@id": `${normalizedBaseUrl}/#organization`},
        "hasPart": [
          {"@type": "WebPage", "name": lang === 'fr' ? "Simuler mon épargne" : "Simulate my savings", "url": `${normalizedBaseUrl}/simuler`},
          {"@type": "WebPage", "name": lang === 'fr' ? "Souscrire" : "Subscribe", "url": `${normalizedBaseUrl}/subscription`},
          {"@type": "WebPage", "name": lang === 'fr' ? "Questions fréquentes" : "Frequently asked questions", "url": `${normalizedBaseUrl}/faq`},
          {"@type": "WebPage", "name": lang === 'fr' ? "Politique de confidentialité" : "Privacy policy", "url": `${normalizedBaseUrl}/privacy`},
          {"@type": "WebPage", "name": lang === 'fr' ? "Connexion" : "Sign in", "url": `${normalizedBaseUrl}/login`}
        ]
      };

    case 'organization':
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${normalizedBaseUrl}/#organization`,
        "name": "ACAM Vie",
        "alternateName": "OpenLife",
        "url": normalizedBaseUrl,
        "logo": `${normalizedBaseUrl}/android-chrome-512x512.png`,
        "description": lang === 'fr' 
          ? "Plateforme d'épargne journalière digitale au Cameroun"
          : "Digital daily savings platform in Cameroon",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "CM",
          "addressLocality": "Douala",
          "addressRegion": "Littoral"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+237681704497",
          "contactType": "customer service",
          "availableLanguage": ["French", "English"]
        },
        "sameAs": [
          "https://www.facebook.com/OpenLifebyACAMVie",
          "https://www.linkedin.com/company/openlifebyacamvie",
          "https://twitter.com/OpenLif24397584"
        ]
      };

    case 'webapp':
      return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": `${normalizedBaseUrl}/#webapplication`,
        "name": "OpenLife",
        "description": lang === 'fr'
          ? "Application mobile d'épargne journalière pour gérer vos finances facilement"
          : "Mobile daily savings app to manage your finances easily",
        "url": normalizedBaseUrl,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "XAF"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1250"
        }
      };

    case 'service':
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${normalizedBaseUrl}/#service`,
        "name": "OpenLife Épargne Journalière",
        "description": lang === 'fr'
          ? "Service d'épargne journalière digitale accessible depuis votre mobile"
          : "Digital daily savings service accessible from your mobile",
        "provider": {
          "@type": "Organization",
          "name": "ACAM Vie"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Cameroun"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": lang === 'fr' ? "Plans d'épargne" : "Savings Plans",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": lang === 'fr' ? "Épargne Journalière" : "Daily Savings"
              }
            }
          ]
        }
      };

    case 'faq':
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };

    default:
      return {};
  }
};

export const generateBreadcrumbList = (breadcrumbs, lang = 'fr') => {
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : WEB_URL;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `${normalizedBaseUrl}${crumb.url.startsWith('/') ? crumb.url : `/${crumb.url}`}`
    }))
  };
};

export const generateLocalBusiness = (lang = 'fr') => {
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : WEB_URL;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "OpenLife by ACAM Vie",
    "description": lang === 'fr'
      ? "Service d'épargne journalière digitale au Cameroun"
      : "Digital daily savings service in Cameroon",
    "url": normalizedBaseUrl,
    "telephone": "+237681704497",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rue des palmiers, Bonanjo",
      "addressLocality": "Douala",
      "addressRegion": "Littoral",
      "postalCode": "00237",
      "addressCountry": "CM"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "3.8480",
      "longitude": "11.5021"
    },
    "openingHours": "Mo-Fr 08:00-18:00",
    "priceRange": "$",
    "paymentAccepted": "XAF, EUR, USD"
  };
};
