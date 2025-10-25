import { Metadata } from 'next';
import { Calendar, Sparkles, Camera, Heart, CheckCircle } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata, generateLocalBusinessSchema } from '@/lib/seo/metadata';
import HeroSection from '@/components/sections/HeroSection';
import ServiceCard from '@/components/sections/ServiceCard';
import CTAButton from '@/components/sections/CTAButton';

interface PageProps {
  params: { locale: Locale };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await getTranslations(params.locale);

  return generatePageMetadata({
    title: translations.site.title,
    description: translations.site.description,
    path: '',
    locale: params.locale,
  });
}

export default async function HomePage({ params }: PageProps) {
  const translations = await getTranslations(params.locale);

  const services = [
    {
      icon: Calendar,
      title: translations.services.reservations.title,
      description: translations.services.reservations.description,
    },
    {
      icon: Sparkles,
      title: translations.services.cleaning.title,
      description: translations.services.cleaning.description,
    },
    {
      icon: Camera,
      title: translations.services.marketing.title,
      description: translations.services.marketing.description,
    },
    {
      icon: Heart,
      title: translations.services.welcome.title,
      description: translations.services.welcome.description,
    },
  ];

  const whyPoints = [
    translations.home.why.expertise,
    translations.home.why.trust,
    translations.home.why.availability,
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessSchema(params.locale)),
        }}
      />

      <HeroSection locale={params.locale} translations={translations} />

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {translations.home.services.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {translations.home.services.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <CTAButton href={`/${params.locale}/services`}>
              {translations.home.services.viewAll}
            </CTAButton>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {translations.home.why.title}
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {whyPoints.map((point, index) => (
              <div key={index} className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-blue-700 flex-shrink-0 mt-1" aria-hidden="true" />
                <p className="text-lg text-gray-700">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <CTAButton href={`/${params.locale}/contact`}>
              {translations.cta.contact}
            </CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}
