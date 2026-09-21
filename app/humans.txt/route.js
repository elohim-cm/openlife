export async function GET() {
  return new Response(`/* HUMANS.TXT */
    
OPENLIFE BY ACAM VIE
https://openlife.acamvie.com

DÉVELOPPEMENT
-------------
Frontend: React, Next.js 13+, Material-UI
Backend: Node.js, Express
Mobile: React Native (iOS, Android)
Design: Material Design, Custom UI Components

ÉQUIPE
------
Développement: Karbura Technologies
Design: ACAM Vie Design Team
Product Owner: ACAM Vie

TECHNOLOGIES
------------
- Framework: Next.js 13.4+ (App Router)
- UI Library: Material-UI (MUI) v5
- Styling: CSS Modules, Styled Components
- State Management: React Context
- Internationalization: react-i18next
- Animation: Framer Motion
- Build Tool: Next.js Built-in
- Deployment: Vercel/AWS

CONTACT
-------
Email: support.openlife@acamvie.com
Phone: +237 681 704 497
WhatsApp: https://wa.me/237681704497

RÉSEAUX SOCIAUX
---------------
Facebook: https://www.facebook.com/OpenLifebyACAMVie
LinkedIn: https://www.linkedin.com/company/openlifebyacamvie
Twitter: https://twitter.com/OpenLif24397584

DERNIÈRE MISE À JOUR: ${new Date().toISOString()}
VERSION: 2.0.0

Merci d'utiliser OpenLife ! 💚
`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
