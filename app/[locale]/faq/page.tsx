import { Metadata } from 'next';
import PageHeader from '@/components/sections/PageHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronDown } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { motion } from 'framer-motion';

interface PageProps {
  params: Promise<{ locale: Locale }>; // ✅ params are now async in Next.js 15
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

      <motion.div
        className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Intro */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-10 shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.45em] text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            {languageLabel}
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="mt-6 text-lg leading-relaxed text-gray-700 sm:text-xl">
            {translations.faq.intro}
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-12">
          <Accordion
            type="single"
            collapsible
            className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-md backdrop-blur-xl divide-y divide-white/60"
          >
            {faq.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger
                  className="group flex w-full items-center justify-between px-6 py-8 text-left transition-all hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9254] sm:px-10"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-[22px] sm:text-[26px] font-light leading-snug text-slate-900 group-hover:text-[#bd9254] transition-colors">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className="ml-4 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-10 sm:px-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
                      {item.answer}
                    </p>
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.div>
    </div>
  );
}
