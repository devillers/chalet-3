import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface HeroSectionProps {
  locale: Locale;
  translations: any;
}

export default function HeroSection({ locale, translations }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-slate-100 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            {translations.home.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            {translations.home.hero.subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href={`/${locale}/services`}
              className="rounded-md bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
            >
              <span>{translations.home.hero.cta}</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="text-base font-semibold text-gray-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 rounded px-4 py-3 transition-colors"
            >
              {translations.cta.contact} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
