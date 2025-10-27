import { Metadata } from 'next';
import Script from 'next/script';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import ContactForm from '@/components/forms/ContactForm';
import PageHeader from '@/components/sections/PageHeader';

// ----------
// Types
// ----------
interface PageProps {
  params: Promise<{ locale: Locale }>;
}

// ----------
// SEO
// ----------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations(locale);

  return generatePageMetadata({
    title: `${translations.contact.title} - Chalet Manager`,
    description: translations.contact.subtitle,
    path: '/contact',
    locale,
  });
}

// ----------
// Page
// ----------
export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations(locale);

  const helperNote =
    t.contact?.form?.helperNote ??
    "En soumettant ce formulaire, vous acceptez d'être recontacté. Vos données sont traitées conformément à notre politique de confidentialité.";

  return (
    <div className="bg-white">
      {/* HERO */}
      <PageHeader
        title={t.contact.title}
        description={t.contact.subtitle}
        imageUrl="/images/TOPO-CHALET-3.png"
      />

      {/* MAIN */}
      <div className="py-12 sm:py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="col-span-2 bg-white p-4 mt-8">
            <div className="text-4xl font-thin uppercase text-gray-600">
              {t.contact.subtitle}
            </div>
          </div>

          <div className="col-span-3 sm:border-l border-gray-200 sm:pl-6 bg-white p-4 mt-8">
            <div className="my-8">
              <ContactForm locale={locale} translations={t} />
            </div>

            {/* Helper notes */}
            <p className="mt-4 text-xs leading-relaxed text-gray-500">{helperNote}</p>
          </div>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <Script id="jsonld-contact" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: `${t.contact.title} - Chalet Manager`,
          description: t.contact.subtitle,
          mainEntity: {
            '@type': 'Organization',
            name: 'Chalet Manager',
            url: 'https://chaletmanager.fr',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: 'contact@chaletmanager.fr',
              telephone: t.contact?.info?.phone || '',
              availableLanguage: ['fr', 'en'],
            },
          },
        })}
      </Script>
    </div>
  );
}
