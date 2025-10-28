import '../globals.css';
import type { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n';
import { Locale } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SessionProviderWrapper from '../../components/providers/SessionProviderWrapper.tsx'; // ✅ ajout

export const dynamic = 'force-dynamic';

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
  };
}

export default async function LocaleLayout({ children, params }: RootLayoutProps) {
  const { locale } = params;
  const translations = await getTranslations(locale);

  return (
    <SessionProviderWrapper>
      <Header locale={locale} translations={translations} />
      <main>{children}</main>
      <Footer locale={locale} translations={translations} />
    </SessionProviderWrapper>
  );
}
