import type { MetadataRoute } from 'next';
import { env } from '@/env';
import { locales } from '@/lib/i18n';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  const now = new Date();

  const localeEntries = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/${locale}/portfolio`,
      lastModified: now,
    },
  ]);

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
    },
    ...localeEntries,
    {
      url: `${baseUrl}/sitemaps/static.xml`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/sitemaps/portfolio-1.xml`,
      lastModified: now,
    },
  ];
}
