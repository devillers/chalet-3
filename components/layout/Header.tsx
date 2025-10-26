'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mountain, ChevronDown, Calendar, Users, Shield, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { type FocusEvent, useEffect, useState } from 'react';
import { Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { pacifico } from '@/lib/fonts';

interface HeaderProps {
  locale: Locale;
  translations: any;
}

export default function Header({ locale, translations }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const pathname = usePathname();

  const servicesMenu = translations.nav.servicesMenu;

  const iconComponents = {
    Calendar,
    Users,
    Shield,
    Sparkles,
    Mountain,
  } as const;

  const localizeHref = (href: string) => {
    if (typeof href !== 'string' || href.length === 0) {
      return href;
    }

    if (!href.startsWith('/')) {
      return href;
    }

    if (href === '/') {
      return `/${locale}`;
    }

    if (href.startsWith('/auth')) {
      return href;
    }

    return `/${locale}${href}`;
  };

  const navigation = [
    { key: 'home', label: translations.nav.home, href: '/' },
    { key: 'services', label: translations.nav.services, href: '/services', megaMenu: Boolean(servicesMenu) },
    { key: 'about', label: translations.nav.about, href: '/about' },
    { key: 'contact', label: translations.nav.contact, href: '/contact' },
  ];

  const dashboardLink = { name: translations.nav.dashboard, href: '/auth/login' };

  const isActive = (href: string) => {
    const activeHref = (localizeHref(href) ?? '').split('#')[0];

    if (activeHref === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }

    return pathname.startsWith(activeHref);
  };

  useEffect(() => {
    if (!megaMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMegaMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [megaMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileServicesOpen(false);
    }
  }, [mobileMenuOpen]);

  const handleMegaMenuBlur = (event: FocusEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;

    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setMegaMenuOpen(false);
    }
  };

  const mobileServicesMenuId = 'mobile-services-menu';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-orange-700" aria-hidden="true" />
              <span className={`${pacifico.className} text-2xl text-gray-900`}>Chalet Manager</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              if (item.megaMenu && servicesMenu) {
                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                    onBlur={handleMegaMenuBlur}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${
                        isActive(item.href)
                          ? 'text-blue-700'
                          : 'text-gray-700'
                      }`}
                      aria-expanded={megaMenuOpen}
                      aria-haspopup="true"
                      onClick={() => setMegaMenuOpen((prev) => !prev)}
                      onFocus={() => setMegaMenuOpen(true)}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    <AnimatePresence>
                      {megaMenuOpen && (
                        <motion.div
                          key="services-mega-menu"
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute left-1/2 top-full mt-4 w-screen max-w-4xl -translate-x-1/2 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5"
                        >
                          <div className="grid gap-8 p-8 lg:grid-cols-[2fr,1fr]">
                            <div className="space-y-8">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                  {servicesMenu.eyebrow}
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">{servicesMenu.title}</p>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                  {servicesMenu.description}
                                </p>
                              </div>
                              <div className="grid gap-6 md:grid-cols-3">
                                {servicesMenu.sections?.map((section: any, sectionIndex: number) => {
                                  const IconComponent =
                                    iconComponents[section.icon as keyof typeof iconComponents] ?? Sparkles;

                                  return (
                                    <motion.div
                                      key={section.title}
                                      className="rounded-xl bg-gray-50 p-4"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: sectionIndex * 0.05 }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex rounded-lg bg-blue-100 p-2 text-blue-700">
                                          <IconComponent className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                                      </div>
                                      <ul className="mt-4 space-y-3">
                                        {section.links?.map((link: any) => {
                                          const localizedHref = localizeHref(link.href);

                                          return (
                                            <li key={link.name}>
                                              <Link
                                                href={localizedHref}
                                                className="block rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                                                onClick={() => setMegaMenuOpen(false)}
                                              >
                                                <p className="text-sm font-medium text-gray-900">{link.name}</p>
                                                <p className="mt-1 text-sm leading-relaxed text-gray-600">{link.description}</p>
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 text-white">
                              <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
                                  {servicesMenu.cta?.title}
                                </p>
                                <p className="mt-2 text-base text-blue-50">{servicesMenu.cta?.description}</p>
                              </div>
                              <Link
                                href={localizeHref(servicesMenu.cta?.href ?? '/contact')}
                                className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                {servicesMenu.cta?.button}
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              const localizedHref = localizeHref(item.href);

              return (
                <Link
                  key={item.key}
                  href={localizedHref}
                  className={`rounded px-2 py-1 text-sm font-medium transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 ${
                    isActive(item.href)
                      ? 'text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={localizeHref(dashboardLink.href)}
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

        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden space-y-2 overflow-hidden pb-4 pt-2"
            >
              {navigation.map((item) => {
                if (item.megaMenu && servicesMenu) {
                  const localizedHref = localizeHref(item.href);

                  return (
                    <div key={item.key} className="rounded-lg border border-gray-100 bg-white">
                      <div className="flex items-center justify-between px-3 py-2">
                        <Link
                          href={localizedHref}
                          className={`flex-1 text-base font-medium ${
                            isActive(item.href)
                              ? 'text-blue-700'
                              : 'text-gray-800'
                          }`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileServicesOpen(false);
                          }}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          className="ml-4 inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                          aria-expanded={mobileServicesOpen}
                          aria-controls={mobileServicesMenuId}
                          onClick={() => setMobileServicesOpen((prev) => !prev)}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {mobileServicesOpen && (
                          <motion.div
                            key="mobile-services"
                            id={mobileServicesMenuId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="space-y-4 border-t border-gray-100 px-3 py-4"
                            style={{ overflow: 'hidden' }}
                          >
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                {servicesMenu.eyebrow}
                              </p>
                              <p className="mt-1 text-base font-semibold text-gray-900">{servicesMenu.title}</p>
                              <p className="mt-2 text-sm leading-relaxed text-gray-600">{servicesMenu.description}</p>
                            </div>
                            {servicesMenu.sections?.map((section: any) => (
                              <div key={section.title} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  {section.title}
                                </p>
                                <div className="space-y-3">
                                  {section.links?.map((link: any) => (
                                    <Link
                                      key={link.name}
                                      href={localizeHref(link.href)}
                                      className="block rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50"
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setMobileServicesOpen(false);
                                      }}
                                    >
                                      <span className="block text-sm font-semibold text-gray-900">{link.name}</span>
                                      <span className="mt-1 block text-sm leading-relaxed text-gray-600">{link.description}</span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <Link
                              href={localizeHref(servicesMenu.cta?.href ?? '/contact')}
                              className="block rounded-md bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileServicesOpen(false);
                              }}
                            >
                              {servicesMenu.cta?.button}
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
              }

              const localizedHref = localizeHref(item.href);

              return (
                <Link
                  key={item.key}
                  href={localizedHref}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={localizeHref(dashboardLink.href)}
              className="block px-3 py-2 text-base font-semibold rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {dashboardLink.name}
            </Link>
            <div className="px-3 py-2">
              <LanguageSwitcher locale={locale} />
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
