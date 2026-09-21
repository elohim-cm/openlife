import { generateServerSideBaseUrl } from '@/lib/seo-server';

export async function GET() {
  const baseUrl = generateServerSideBaseUrl();
  
  const images = [
    {
      url: `${baseUrl}/`,
      title: "OpenLife - Épargne Journalière Digitale",
      caption: "Gérez votre épargne journalière en 05 minutes sur votre téléphone",
      images: [
        {
          loc: `${baseUrl}/android-chrome-512x512.png`,
          title: "OpenLife Logo",
          caption: "Logo officiel de l'application OpenLife"
        },
        {
          loc: `${baseUrl}/images/hero-banner.jpg`,
          title: "OpenLife Application",
          caption: "Interface mobile de l'application OpenLife"
        },
        {
          loc: `${baseUrl}/images/homme.png`,
          title: "Open Life - Épargne digitale",
          caption: "Open Life permet de constituer progressivement son épargne depuis son téléphone"
        },
        {
          loc: `${baseUrl}/images/les_mama.png`,
          title: "Épargner avec Open Life",
          caption: "Une solution d'épargne journalière pensée pour les projets du quotidien"
        },
        {
          loc: `${baseUrl}/images/parents_child.jpg`,
          title: "Préparer l'avenir avec Open Life",
          caption: "Constituer un capital pour ses projets et ceux de sa famille"
        },
        {
          loc: `${baseUrl}/images/mobile-app/mockup-hero-light.png`,
          title: "Application mobile Open Life",
          caption: "Interface de l'application mobile Open Life"
        }
      ]
    },
    {
      url: `${baseUrl}/faq`,
      title: "FAQ OpenLife - Questions Fréquentes",
      caption: "Réponses à toutes vos questions sur l'épargne journalière avec OpenLife",
      images: [
        {
          loc: `${baseUrl}/images/faq-illustration.jpg`,
          title: "FAQ OpenLife",
          caption: "Illustration de la page FAQ"
        }
      ]
    }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images.map(page => `  <url>
    <loc>${page.url}</loc>
    ${page.images.map(img => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>`).join('\n')}
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
