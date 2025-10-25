import { Metadata } from 'next';
import { Calendar, Sparkles, Camera, Heart } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import ServiceCard from '@/components/sections/ServiceCard';
import CTAButton from '@/components/sections/CTAButton';
import PageHeader from '@/components/sections/PageHeader';

interface PageProps {
  params: { locale: Locale };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await getTranslations(params.locale);

  return generatePageMetadata({
    title: `${translations.services.title} - Chalet Manager`,
    description: translations.services.subtitle,
    path: '/services',
    locale: params.locale,
  });
}

export default async function ServicesPage({ params }: PageProps) {
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

  return (
    <div className="bg-white">
      <PageHeader
        title={translations.services.title}
        description={translations.services.subtitle}
        imageUrl="https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

          <div className="mt-16 text-center">
            <CTAButton href={`/${params.locale}/contact`}>
              {translations.cta.quote}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
