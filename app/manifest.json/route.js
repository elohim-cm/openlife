import { generateServerSideBaseUrl } from '@/lib/seo-server';

export async function GET() {
  const baseUrl = generateServerSideBaseUrl();
  
  return new Response(JSON.stringify({
    "name": "OpenLife - Épargne Journalière Digitale",
    "short_name": "OpenLife",
    "description": "Gérez votre épargne journalière en 05 minutes sur votre téléphone, avec l'application Open Life !",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#0d6732",
    "orientation": "portrait",
    "scope": "/",
    "lang": "fr",
    "dir": "ltr",
    "categories": ["finance", "business", "productivity"],
    "icons": [
      {
        "src": "/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "screenshots": [
      {
        "src": "/images/app-screenshot-1.png",
        "sizes": "1280x720",
        "type": "image/png",
        "form_factor": "wide",
        "label": "Tableau de bord OpenLife"
      },
      {
        "src": "/images/app-screenshot-2.png",
        "sizes": "640x1136",
        "type": "image/png",
        "form_factor": "narrow",
        "label": "Simulation d'épargne"
      }
    ],
    "shortcuts": [
      {
        "name": "Nouvelle Épargne",
        "short_name": "Épargner",
        "description": "Commencer une nouvelle épargne journalière",
        "url": "/simuler",
        "icons": [{ "src": "/favicon-96x96.png", "sizes": "96x96" }]
      },
      {
        "name": "Mon Compte",
        "short_name": "Compte",
        "description": "Accéder à mon compte OpenLife",
        "url": "/login",
        "icons": [{ "src": "/favicon-96x96.png", "sizes": "96x96" }]
      }
    ],
    "related_applications": [],
    "prefer_related_applications": false,
    "edge_side_panel": {
      "preferred_width": 400
    },
    "launch_handler": {
      "client_mode": ["navigate-existing", "auto"]
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}
