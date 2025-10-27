import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { env } from '@/env';
import { PropertyModel } from '@/lib/db/models/property';

interface PortfolioDetailProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PortfolioDetailProps): Promise<Metadata> {
  const property = await PropertyModel.findOne({ slug: params.slug, status: 'published' });
  if (!property) {
    return {
      title: 'Bien introuvable — Chalet Manager',
      robots: { index: false, follow: false },
    };
  }
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  const hero = property.images.find((image) => image.isHero) ?? property.images[0];
  const imageUrl = hero ? `${hero.url}?w=1200&h=630&c=fill&g=auto&f=auto&q=auto` : undefined;

  return {
    title: `${property.title} — Chalet Manager`,
    description: property.description ?? 'Découvrez ce bien disponible à la location.',
    alternates: {
      canonical: `${baseUrl}/portfolio/${property.slug}`,
    },
    openGraph: {
      url: `${baseUrl}/portfolio/${property.slug}`,
      title: property.title,
      description: property.description ?? 'Découvrez ce bien disponible à la location.',
      type: 'article',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: hero?.alt ?? property.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: property.description ?? 'Découvrez ce bien disponible à la location.',
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailProps) {
  const property = await PropertyModel.findOne({ slug: params.slug, status: 'published' });
  if (!property) {
    notFound();
  }
  const hero = property.images.find((image) => image.isHero) ?? property.images[0];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-semibold">{property.title}</h1>
      <p className="mt-2 text-muted-foreground">{property.address?.city ?? 'Ville inconnue'}</p>
      {hero ? (
        <div className="mt-6 overflow-hidden rounded-xl border">
          <Image src={hero.url} alt={hero.alt ?? property.title} width={hero.width || 1200} height={hero.height || 630} />
        </div>
      ) : null}
      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Description</h2>
        <p className="text-muted-foreground">{property.description ?? 'La description sera disponible prochainement.'}</p>
      </section>
    </main>
  );
}
