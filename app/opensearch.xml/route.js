import { generateServerSideBaseUrl } from '@/lib/seo-server';

export async function GET() {
  const baseUrl = generateServerSideBaseUrl();
  
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" 
                       xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>OpenLife</ShortName>
  <Description>Recherche OpenLife - Épargne Journalière Digitale</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <Image width="16" height="16" type="image/x-icon">${baseUrl}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${baseUrl}/search?q={searchTerms}" />
  <Url type="application/x-suggestions+json" method="get" template="${baseUrl}/api/search-suggestions?q={searchTerms}" />
  <moz:SearchForm>${baseUrl}</moz:SearchForm>
</OpenSearchDescription>`, {
    status: 200,
    headers: {
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
