// app/[locale]/not-found.tsx

import Link from 'next/link';
import { Home } from 'lucide-react';
import { getTranslations, defaultLocale } from '@/lib/i18n';

export default async function NotFound() {
  const translations = await getTranslations(defaultLocale);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {translations.errors['404'].title}
        </h2>
        <p className="text-gray-600 mb-8">
          {translations.errors['404'].description}
        </p>
        <Link
          href={`/${defaultLocale}`}
          className="inline-flex items-center space-x-2 rounded-md bg-blue-700 px-6 py-3 text-base font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 transition-all"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span>{translations.errors['404'].home}</span>
        </Link>
      </div>
    </div>
  );
}
