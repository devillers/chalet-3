import { Metadata } from 'next';

import PageHeader from '@/components/sections/PageHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';

interface PageProps {
  params: { locale: Locale };
}

type FAQEntry = {
  id: string;
  question: string;
  answer: string;
};

type FAQTranslations = {
  title: string;
  subtitle: string;
  intro: string;
  items: FAQEntry[];
};

const FAQ_IMAGE =
  'https://images.pexels.com/photos/2079243/pexels-photo-2079243.jpeg?auto=compress&cs=tinysrgb&w=1920';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const translations = await getTranslations(locale);

  return generatePageMetadata({
    title: `${translations.faq.title} - Chalet Manager`,
    description: translations.faq.subtitle,
    path: '/faq',
    locale,
  });
}

export default async function FAQPage({ params }: PageProps) {
  const { locale } = params;

  const translations = await getTranslations(locale);
  const faq = translations.faq as FAQTranslations;

  const languageLabel = locale === 'fr' ? 'Français' : 'English';

  const localizedSchemaEntities = faq.items.map((item) => {
    const question = item.question;
    const answer = item.answer;

    return {
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    };
  });

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: localizedSchemaEntities,
  };

  return (
    <div className="bg-[#f8f6f3]">
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

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-10 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.45em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            {languageLabel}
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
            {translations.faq.intro}
          </p>
        </div>

        <div className="mt-12">
          <Accordion
            type="single"
            collapsible
            className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-sm backdrop-blur"
          >
            {faq.items.map((item, index) => {
              return (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className={
                    index === faq.items.length - 1
                      ? 'border-none'
                      : 'border-b border-white/60'
                  }
                >
                  <AccordionTrigger className="px-6 py-8 text-left text-slate-900 transition-colors hover:bg-white/40 hover:no-underline sm:px-10">
                    <div className="flex flex-col text-left">
                      <span className="mt-3 text-2xl font-light leading-snug text-slate-900 sm:text-[28px]">
                        {item.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-10 sm:px-10">
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        {languageLabel}
                      </p>
                      <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                        {item.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
