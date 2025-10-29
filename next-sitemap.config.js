const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, '')}`
  : undefined;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  vercelUrl ||
  'https://chaletmanager.fr';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*'],
  alternateRefs: [
    {
      href: siteUrl,
      hreflang: 'fr',
    },
    {
      href: `${siteUrl}/en`,
      hreflang: 'en',
    },
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
  },
};
