import { Metadata } from 'next';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import PageHeader from '@/components/sections/PageHeader';

interface PageProps {
  params: { locale: Locale };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const translations = await getTranslations(params.locale);

  return generatePageMetadata({
    title: `${translations.privacy.title} - Chalet Manager`,
    description: translations.privacy.intro,
    path: '/privacy-policy',
    locale: params.locale,
  });
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const translations = await getTranslations(params.locale);

  return (
    <div className="bg-white">
      <PageHeader
        title={translations.privacy.title}
        description={translations.privacy.intro}
        imageUrl="https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />
      <div className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {translations.privacy.data.title}
            </h2>
            <p className="text-gray-700">{translations.privacy.data.content}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {translations.privacy.purpose.title}
            </h2>
            <p className="text-gray-700">{translations.privacy.purpose.content}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {translations.privacy.retention.title}
            </h2>
            <p className="text-gray-700">{translations.privacy.retention.content}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {translations.privacy.rights.title}
            </h2>
            <p className="text-gray-700">{translations.privacy.rights.content}</p>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
