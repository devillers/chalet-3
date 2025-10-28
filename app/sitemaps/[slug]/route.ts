


// app/sitemaps/[slug]/route.ts

export async function GET(
  request: Request,
  context: { params: { slug: string } }
) {
  const { slug } = context.params;

  // Exemple de génération de sitemap dynamique
  const urls = [
    { loc: `https://chaletmanager.fr/${slug}/1`, lastmod: new Date().toISOString() },
    { loc: `https://chaletmanager.fr/${slug}/2`, lastmod: new Date().toISOString() },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (u) => `
      <url>
        <loc>${u.loc}</loc>
        <lastmod>${u.lastmod}</lastmod>
      </url>`
      )
      .join('')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
