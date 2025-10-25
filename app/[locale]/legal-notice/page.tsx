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
    title: `${translations.legal.title} - Chalet Manager`,
    description: translations.legal.title,
    path: '/legal-notice',
    locale: params.locale,
  });
}

export default async function LegalNoticePage({ params }: PageProps) {
  const translations = await getTranslations(params.locale);

  return (
    <div className="bg-white">
      <PageHeader
        title={translations.legal.title}
        imageUrl="https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />
      <div className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {translations.legal.publisher.title}
            </h2>
            <div className="text-gray-700 whitespace-pre-line">
              {translations.legal.publisher.content}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {translations.legal.host.title}
            </h2>
            <div className="text-gray-700 whitespace-pre-line">
              {translations.legal.host.content}
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
