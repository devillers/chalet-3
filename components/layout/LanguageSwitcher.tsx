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
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-500" />
      <div className="flex gap-1">
        {locales.map((loc) => (
          <Link
            key={loc}
            href={`/${loc}${pathWithoutLocale}`}
            className={`text-xs font-light px-2 py-1 rounded transition-colors ${
              locale === loc
                ? 'bg-amber-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label={`Switch to ${loc === 'fr' ? 'French' : 'English'}`}
          >
            {loc.toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}
