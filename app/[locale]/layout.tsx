import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales, Locale, getTranslations } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: paramsLocale } = await Promise.resolve(params);

  if (!locales.includes(paramsLocale as Locale)) {
    notFound();
  }

  const locale = paramsLocale as Locale;
  const translations = await getTranslations(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} translations={translations} />
      <div className="flex-1">{children}</div>
      <Footer locale={locale} translations={translations} />
    </div>
  );
}
