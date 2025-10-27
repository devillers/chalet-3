
//app/[locale]/portfolio/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/env';
import { PropertyModel, type PropertyDocument } from '@/lib/db/models/property';
import { locales, type Locale } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

interface PortfolioPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Record<string, string | string[] | undefined>;
}

const PAGE_SIZE = 12;

const OG_LOCALES: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_US',
};

export async function generateMetadata({ params, searchParams }: PortfolioPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  const pageParam = Number(searchParams.page ?? '1');
  const querySuffix = pageParam > 1 ? `?page=${pageParam}` : '';
  const canonicalPath = `/${locale}/portfolio${querySuffix}`;
  const canonical = `${baseUrl}${canonicalPath}`;
  const hasFilters = ['city', 'capacityMin', 'dateFrom', 'dateTo'].some((key) => Boolean(searchParams[key]));

  const languageAlternates = locales.reduce<Record<string, string>>((acc, currentLocale) => {
    acc[currentLocale] = `${baseUrl}/${currentLocale}/portfolio${querySuffix}`;
    return acc;
  }, {});

  return {
    title: 'Portfolio — Chalet Manager',
    description: 'Découvrez les locations de prestige disponibles à la réservation.',
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      url: canonical,
      title: 'Portfolio — Chalet Manager',
      description: 'Sélection de locations publiées',
      type: 'website',
      siteName: 'Chalet Manager',
      locale: OG_LOCALES[locale],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Portfolio — Chalet Manager',
      description: 'Sélection de locations publiées',
    },
    robots: hasFilters
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}

export default async function PortfolioPage({ params, searchParams }: PortfolioPageProps) {
  const { locale } = await params;
  const page = Number(searchParams.page ?? '1');
  const skip = (page - 1) * PAGE_SIZE;
  const properties: PropertyDocument[] = await PropertyModel.find({ status: 'published' }, {
    sort: { publishedAt: -1 },
    skip,
    limit: PAGE_SIZE,
  });
  const total = await PropertyModel.countDocuments({ status: 'published' });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold">Portfolio</h1>
        <p className="text-muted-foreground">
          Les biens publiés sont visibles ci-dessous. Ce catalogue se met à jour automatiquement après chaque publication.
        </p>
      </header>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucune annonce publiée</CardTitle>
              <CardDescription>
                Publiez votre premier bien pour le rendre visible dans le portfolio public.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          properties.map((property) => (
            <Card key={property._id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>
                  {property.address?.city ?? 'Ville inconnue'} — Capacité {property.capacity ?? 'N/C'}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={`/${locale}/portfolio/${property.slug}`} className="text-primary underline">
                  Voir le détail
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </section>
      <div className="mt-10 flex justify-center">
        <Pagination>
          <PaginationContent>
            {Array.from({ length: pageCount }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink href={`/${locale}/portfolio?page=${pageNumber}`} isActive={pageNumber === page}>
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  );
}
