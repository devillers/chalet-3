import { Metadata } from 'next';
import PageHeader from '@/components/sections/PageHeader';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import FAQContent from '@/components/faq/FAQContent';
import type { FAQTranslations } from '@/types/faq';

interface PageProps {
  params: Promise<{ locale: Locale }>; // ✅ params are now async in Next.js 15
}

const FAQ_IMAGE =
  'https://images.pexels.com/photos/2079243/pexels-photo-2079243.jpeg?auto=compress&cs=tinysrgb&w=1920';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params; // ✅ await params
  const translations = await getTranslations(locale);

  return generatePageMetadata({
    title: `${translations.faq.title} - Chalet Manager`,
    description: translations.faq.subtitle,
    path: '/faq',
    locale,
  });
}

export default async function FAQPage({ params }: PageProps) {
  const { locale } = await params; // ✅ await params
  const translations = await getTranslations(locale);
  const faq = translations.faq as FAQTranslations;
  const languageLabel = locale === 'fr' ? 'Français' : 'English';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <div className="bg-gradient-to-b from-[#f8f6f3] to-[#f1ede8]">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHeader
        title={translations.faq.title}
        description={translations.faq.subtitle}
        imageUrl={FAQ_IMAGE}
      />

      <FAQContent
        languageLabel={languageLabel}
        intro={translations.faq.intro}
        items={faq.items}
      />
    </div>
  );
}
