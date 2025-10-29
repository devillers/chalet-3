// filepath: app/sitemaps/[slug]/route.ts


// import { env } from '@/env';

// export async function GET(_: Request, context: { params: { slug: string } }) {
//   const baseUrl = env.SITE_URL.replace(/\/$/, '');
//   const slug = context.params.slug;
//   if (!slug.startsWith('portfolio-')) {
//     return new Response('Not Found', { status: 404 });
//   }
//   const page = Number(slug.replace('portfolio-', '').replace('.xml', '')) || 1;
//   const urls: string[] = [];
//   const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
//     `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
//     urls
//       .map((path) => `<url><loc>${baseUrl}${path}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`)
//       .join('') +
//     '</urlset>';
//   return new Response(body, {
//     headers: {
//       'Content-Type': 'application/xml; charset=utf-8',
//       'Cache-Control': 'no-store',
//       'X-Sitemap-Page': String(page),
//     },
//   });
// }

// app/sitemaps/[slug]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://chaletmanager.fr/${slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
  </urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
