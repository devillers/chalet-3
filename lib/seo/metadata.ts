import { Metadata } from 'next';
import { env } from '@/env';
import { Locale } from '../i18n';

const SITE_URL = env.SITE_URL.replace(/\/$/, '');

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  alternateLocales?: Locale[];
}

export function generatePageMetadata({
  title,
  description,
  path,
  locale,
  alternateLocales = ['fr', 'en'],
}: PageMetadata): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const imageUrl = `${SITE_URL}/images/og-image.jpg`;

  const languages: Record<string, string> = {};
  alternateLocales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}${path}`;
  });

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Chalet Manager',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateLocalBusinessSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Chalet Manager',
    description:
      locale === 'fr'
        ? 'Service professionnel de gestion de chalets'
        : 'Professional chalet management service',
    url: `${SITE_URL}/${locale}`,
    telephone: '+33450XXXXXX',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressLocality: 'Les Alpes',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 45.9237,
      longitude: 6.8694,
    },
    priceRange: '€€€',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 45.9237,
        longitude: 6.8694,
      },
      geoRadius: '50000',
    },
  };
}
