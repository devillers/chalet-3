import type { MetadataRoute } from 'next';
import { env } from '@/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  const now = new Date();
  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: now,
    },
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
