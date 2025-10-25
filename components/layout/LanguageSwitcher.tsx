'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { Locale, locales, getPathWithoutLocale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  locale: Locale;
}

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-500" aria-hidden="true" />
      <div className="flex space-x-1">
        {locales.map((loc) => (
          <Link
            key={loc}
            href={`/${loc}${pathWithoutLocale}`}
            locale={loc}
            className={`text-sm font-medium px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${
              locale === loc
                ? 'text-blue-700 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label={`Switch to ${loc === 'fr' ? 'French' : 'English'}`}
            aria-current={locale === loc ? 'true' : undefined}
          >
            {loc.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
