'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mountain } from 'lucide-react';
import { useState } from 'react';
import { Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  locale: Locale;
  translations: any;
}

export default function Header({ locale, translations }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: translations.nav.home, href: `/${locale}` },
    { name: translations.nav.services, href: `/${locale}/services` },
    { name: translations.nav.about, href: `/${locale}/about` },
    { name: translations.nav.contact, href: `/${locale}/contact` },
  ];

  const dashboardLink = { name: translations.nav.dashboard, href: '/auth/login' };

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-blue-700" aria-hidden="true" />
              <span className="text-xl font-bold text-gray-900">Chalet Manager</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 rounded px-2 py-1 ${
                  isActive(item.href)
                    ? 'text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={dashboardLink.href}
              className="text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded-md px-3 py-1.5 transition-colors"
            >
              {dashboardLink.name}
            </Link>
            <LanguageSwitcher locale={locale} />
          </div>

          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                  isActive(item.href)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={dashboardLink.href}
              className="block px-3 py-2 text-base font-semibold rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dashboardLink.name}
            </Link>
            <div className="px-3 py-2">
              <LanguageSwitcher locale={locale} />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
