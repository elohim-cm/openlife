import Head from 'next/head';
import { generateHreflangTags, generateCanonicalUrl } from '@/lib/seo';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  canonical = '',
  lang = 'fr',
  ogImage = '/android-chrome-512x512.png',
  ogType = 'website',
  noIndex = false,
  structuredData = null
}) => {
  const hreflangTags = generateHreflangTags(canonical || '/', lang);
  const canonicalUrl = generateCanonicalUrl(canonical || '/', lang);

  const defaultTitle = lang === 'fr' 
    ? 'OpenLife - Épargne Journalière Digitale' 
    : 'OpenLife - Digital Daily Savings';
  
  const defaultDescription = lang === 'fr'
    ? 'Gérez votre épargne journalière en 05 minutes sur votre téléphone, avec l\'application Open Life !'
    : 'Manage your daily savings in 05 minutes on your phone with the Open Life app!';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const imageAlt = lang === 'fr' ? 'Logo officiel Open Life par ACAM Vie' : 'Official Open Life by ACAM Vie logo';
  const finalKeywords = keywords || (lang === 'fr' 
    ? 'épargne, épargne journalière, épargne digitale, OpenLife, ACAM Vie, assurance vie, investissement, Cameroun, Afrique'
    : 'savings, daily savings, digital savings, OpenLife, ACAM Vie, life insurance, investment, Cameroon, Africa');

  // JSON-LD Structured Data
  const structuredDataScript = structuredData ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  ) : null;

  return (
    <Head>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      
      {/* Canonical et hreflang */}
      <link rel="canonical" href={canonicalUrl} />
      {hreflangTags.map((tag, index) => (
        <link key={index} rel="alternate" hrefLang={tag.hrefLang} href={tag.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow" />
          <meta name="bingbot" content="index, follow" />
        </>
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content="Open Life" />
      <meta property="og:locale" content={lang === 'fr' ? 'fr_CM' : 'en_CM'} />
      <meta property="og:locale:alternate" content={lang === 'fr' ? 'en_CM' : 'fr_CM'} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content="@OpenLif24397584" />
      
      {/* Additional SEO */}
      <meta name="author" content="ACAM Vie" />
      <meta name="content-language" content={lang} />
      <meta name="language" content={lang === 'fr' ? 'Français' : 'English'} />
      
      {/* Geolocation */}
      <meta name="geo.region" content="CM" />
      <meta name="geo.placename" content="Cameroun" />
      <meta name="geo.position" content="3.8480;11.5021" />
      <meta name="ICBM" content="3.8480,11.5021" />
      
      {/* Structured Data */}
      {structuredDataScript}
    </Head>
  );
};

export default SEOHead;
