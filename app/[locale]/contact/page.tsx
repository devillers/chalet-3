import { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import ContactForm from '@/components/forms/ContactForm';
import PageHeader from '@/components/sections/PageHeader';

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

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

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const translations = await getTranslations(locale);

  return (
    <div className="bg-white">
      <PageHeader
        title={translations.contact.title}
        description={translations.contact.subtitle}
        imageUrl="https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {translations.contact.info.title}
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a
                    href="mailto:contact@chaletmanager.fr"
                    className="text-gray-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 rounded"
                  >
                    {translations.contact.info.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {translations.contact.form.phone}
                  </p>
                  <p className="text-gray-600">{translations.contact.info.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {translations.contact.info.address.split(',')[0]}
                  </p>
                  <p className="text-gray-600">{translations.contact.info.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <ContactForm locale={locale} translations={translations} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
