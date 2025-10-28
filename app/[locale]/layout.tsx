// filepath: app/[locale]/layout.tsx

import '../globals.css';
import type { Metadata } from 'next';
import { defaultLocale, getTranslations, locales, Locale } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SessionProviderWrapper from '../../components/providers/SessionProviderWrapper.tsx'; // ✅ ajout

export const dynamic = 'force-dynamic';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawLocale = resolvedParams?.locale;
  const locale = locales.includes(rawLocale as Locale) ? (rawLocale as Locale) : defaultLocale;

  const t = await getTranslations(locale);
  const meta = t.meta ?? t.site ?? {};

  return {
    title: meta.title ?? 'Chalet Manager',
    description:
      meta.description ??
      'Gestion de locations de prestige. Services professionnels pour propriétaires de chalets haut de gamme.',
  };
}

export default async function LocaleLayout({ children, params }: RootLayoutProps) {
  const resolvedParams = await params;
  const rawLocale = resolvedParams?.locale;
  const locale = locales.includes(rawLocale as Locale) ? (rawLocale as Locale) : defaultLocale;
  const translations = await getTranslations(locale);

  return (
    <SessionProviderWrapper>
      <Header locale={locale} translations={translations} />
      <main>{children}</main>
      <Footer locale={locale} translations={translations} />
    </SessionProviderWrapper>
  );
}
