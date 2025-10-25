import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import '../globals.css';
import { locales, Locale, getTranslations } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale as Locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const translations = await getTranslations(locale);

  return (
    <html lang={locale} className={inter.className}>
      <body className="flex min-h-screen flex-col">
        <Header locale={locale} translations={translations} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} translations={translations} />
      </body>
    </html>
  );
}
