import { Metadata } from 'next';
import { Calendar, Sparkles, Camera, Heart } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import ServiceCard from '@/components/sections/ServiceCard';
import CTAButton from '@/components/sections/CTAButton';
import PageHeader from '@/components/sections/PageHeader';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const translations = await getTranslations(locale);

  return generatePageMetadata({
    title: `${translations.services.title} - Chalet Manager`,
    description: translations.services.subtitle,
    path: '/services',
    locale,
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  const translations = await getTranslations(locale);

  const services = [
    {
      id: 'reservations',
      icon: Calendar,
      title: translations.services.reservations.title,
      description: translations.services.reservations.description,
    },
    {
      id: 'cleaning',
      icon: Sparkles,
      title: translations.services.cleaning.title,
      description: translations.services.cleaning.description,
    },
    {
      id: 'marketing',
      icon: Camera,
      title: translations.services.marketing.title,
      description: translations.services.marketing.description,
    },
    {
      id: 'welcome',
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
              id={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

          <div className="mt-16 text-center">
            <CTAButton href={`/${locale}/contact`}>
              {translations.cta.quote}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}
