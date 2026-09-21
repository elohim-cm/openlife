export async function GET() {
  return new Response(`{
    "report_to": "default",
    "max_age": 31536000,
    "endpoints": [
      {
        "url": "https://openlife.acamvie.com/api/csp-reports"
      }
    ],
    "group": "default",
    "include_subdomains": true
  }`, {
    status: 200,
    headers: {
      'Content-Type': 'application/report-to+json',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
