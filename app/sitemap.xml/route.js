import { generateServerSideBaseUrl } from '@/lib/seo-server';

export async function GET() {
  const baseUrl = generateServerSideBaseUrl();
  const currentDate = new Date().toISOString();
  
  const languages = [
    { code: 'fr', path: '' },
    { code: 'en', path: '/en' }
  ];

  const pages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/faq', priority: '0.8', changefreq: 'weekly' },
    { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { path: '/login', priority: '1.0', changefreq: 'daily' },
    { path: '/simuler', priority: '0.9', changefreq: 'daily' },
    { path: '/subscription', priority: '0.9', changefreq: 'weekly' }
  ];

  const homeImages = [
    { loc: `${baseUrl}/images/homme.png`, title: 'Open Life - épargne digitale au Cameroun' },
    { loc: `${baseUrl}/images/les_mama.png`, title: 'Open Life - épargner pour ses projets' },
    { loc: `${baseUrl}/images/parents_child.jpg`, title: 'Open Life - préparer l’avenir de sa famille' },
    { loc: `${baseUrl}/images/mobile-app/mockup-hero-light.png`, title: 'Application mobile Open Life' }
  ];

  const sitemapEntries = languages.flatMap(lang => 
    pages.map(page => ({
      url: `${baseUrl}${lang.path}${page.path}`,
      lastModified: currentDate,
      changeFrequency: page.changefreq,
      priority: page.priority,
      images: page.path === '' ? homeImages : [],
      alternates: {
        languages: languages.reduce((acc, altLang) => {
          acc[altLang.code] = `${baseUrl}${altLang.path}${page.path}`;
          return acc;
        }, {})
      }
    }))
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
    ${entry.images.map(image => `    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:title>${image.title}</image:title>
    </image:image>`).join('\n')}
    ${Object.entries(entry.alternates.languages).map(([lang, url]) => 
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`
    ).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${entry.alternates.languages.fr}" />
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
