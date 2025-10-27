import type { MetadataRoute } from 'next';
import { env } from '@/env';

export default function robots(): MetadataRoute.Robots {
  const isStaging = env.NEXT_PUBLIC_IS_STAGING === 'true';
  const baseUrl = env.SITE_URL;
  const rules: MetadataRoute.Robots['rules'] = isStaging
    ? [
        {
          userAgent: '*',
          disallow: '/',
        },
      ]
    : [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/signin',
            '/signup',
            '/onboarding',
            '/dashboard',
            '/dashboard/',
            '/dashboard/*',
            '/admin',
            '/admin/*',
            '/superadmin',
            '/superadmin/*',
            '/api',
            '/api/*',
          ],
        },
      ];

  return {
    rules,
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}
