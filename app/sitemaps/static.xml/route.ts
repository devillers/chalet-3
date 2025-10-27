import { env } from '@/env';
import { locales } from '@/lib/i18n';

export async function GET() {
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  const localePaths = locales.flatMap((locale) => [`/${locale}`, `/${locale}/portfolio`]);
  const urls = ['/', ...localePaths];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map((path) => `<url><loc>${baseUrl}${path}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`)
      .join('') +
    '</urlset>';
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
