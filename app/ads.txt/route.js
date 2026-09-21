import { generateServerSideBaseUrl } from '@/lib/seo-server';

export async function GET() {
  const baseUrl = generateServerSideBaseUrl();
  
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<AdsText xmlns="http://www.google.com/ads.txt">
  openlife.acamvie.com, ${baseUrl}/ads-verification.txt, DIRECT, f08c47fef0957f0
  google.com, pub-0000000000000000, DIRECT, f08c47fef0957f0
</AdsText>`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
