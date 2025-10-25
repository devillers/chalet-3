/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://chaletmanager.fr',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*'],
  alternateRefs: [
    {
      href: process.env.NEXT_PUBLIC_SITE_URL || 'https://chaletmanager.fr',
      hreflang: 'fr',
    },
    {
      href: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chaletmanager.fr'}/en`,
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
