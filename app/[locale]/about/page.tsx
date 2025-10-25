import { Metadata } from 'next';
import { Award, Shield, Lightbulb } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import CTAButton from '@/components/sections/CTAButton';
import PageHeader from '@/components/sections/PageHeader';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations(locale);

  return generatePageMetadata({
    title: `${translations.about.title} - Chalet Manager`,
    description: translations.about.subtitle,
    path: '/about',
    locale,
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const translations = await getTranslations(locale);

  const values = [
    {
      icon: Award,
      title: translations.about.values.excellence.title,
      description: translations.about.values.excellence.description,
    },
    {
      icon: Shield,
      title: translations.about.values.trust.title,
      description: translations.about.values.trust.description,
    },
    {
      icon: Lightbulb,
      title: translations.about.values.innovation.title,
      description: translations.about.values.innovation.description,
    },
  ];

  return (
    <div className="bg-white">
      <PageHeader
        title={translations.about.title}
        description={translations.about.subtitle}
        imageUrl="https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <section className="mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {translations.about.story.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {translations.about.story.content}
            </p>
          </div>
        </section>

        <section className="py-12 bg-gray-50 rounded-lg">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
              {translations.about.values.title}
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="inline-flex rounded-full bg-blue-100 p-4 mb-4">
                    <value.icon className="h-8 w-8 text-blue-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

          <div className="mt-16 text-center">
          <CTAButton href={`/${locale}/contact`}>
            {translations.cta.contact}
          </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
