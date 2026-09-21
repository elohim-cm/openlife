import { generateServerSideBaseUrl } from '@/lib/seo-server';

export async function GET() {
  const baseUrl = generateServerSideBaseUrl();
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-image.xml

# Crawl-delay
Crawl-delay: 1

# Specific rules for major crawlers
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /*.json$

# Allow specific API endpoints for SEO
Allow: /api/sitemap
Allow: /api/metadata`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}
