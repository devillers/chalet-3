'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Mountain, ChevronDown, Calendar, Users, Shield, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { type FocusEvent, useEffect, useRef, useState } from 'react';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const servicesMenu = translations.nav.servicesMenu;
  const iconComponents = { Calendar, Users, Shield, Sparkles, Mountain } as const;

  const localizeHref = (href: string) => {
    if (typeof href !== 'string' || href.length === 0) return href;
    if (!href.startsWith('/')) return href;
    if (href === '/') return `/${locale}`;
    if (href.startsWith('/auth')) return href;
    return `/${locale}${href}`;
  };

  const navigation = [
    { key: 'home', label: translations.nav.home, href: '/' },
    {
      key: 'services',
      label: translations.nav.services,
      href: '/services',
      megaMenu: Boolean(servicesMenu),
    },
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

  // Delay closing the mega menu for better UX
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setMegaMenuOpen(false), 400);
  };

  const handleMegaMenuBlur = (event: FocusEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setMegaMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!mobileMenuOpen) setMobileServicesOpen(false);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Mountain className="h-8 w-8 text-amber-600" aria-hidden="true" />
            <span className={`${pacifico.className} text-2xl text-gray-900`}>Chalet Manager</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => {
              if (item.megaMenu && servicesMenu) {
                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onBlur={handleMegaMenuBlur}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-amber-700'
                          : 'text-gray-700 hover:text-amber-700'
                      }`}
                      aria-expanded={megaMenuOpen}
                      aria-haspopup="true"
                      onClick={() => setMegaMenuOpen((prev) => !prev)}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          megaMenuOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {/* MEGA MENU */}
                    <AnimatePresence>
                      {megaMenuOpen && (
                        <motion.div
                          key="services-mega-menu"
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                          className="absolute top-full left-1/2 mt-4 w-[min(1100px,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-gray-200 bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur-lg sm:w-[min(1100px,calc(100vw-4rem))] lg:w-[min(1100px,calc(100vw-6rem))]"
                        >
                          <div className="grid gap-10 p-10 items-start justify-center lg:grid-cols-[2fr,1fr]">
                            <div className="space-y-10">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                  {servicesMenu.eyebrow}
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-gray-900">
                                  {servicesMenu.title}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                  {servicesMenu.description}
                                </p>
                              </div>

                              {/* Sections */}
                              <div className="grid gap-6 md:grid-cols-3">
                                {servicesMenu.sections?.map((section: any, index: number) => {
                                  const IconComponent =
                                    iconComponents[section.icon as keyof typeof iconComponents] ??
                                    Sparkles;
                                  return (
                                    <motion.div
                                      key={section.title}
                                      className="rounded-2xl bg-gray-50 p-5 hover:bg-gray-100 transition-colors shadow-sm"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex rounded-full bg-amber-100 p-2 text-amber-700">
                                          <IconComponent className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <p className="text-sm font-semibold text-gray-900">
                                          {section.title}
                                        </p>
                                      </div>
                                      <ul className="mt-4 space-y-2">
                                        {section.links?.map((link: any) => (
                                          <li key={link.name}>
                                            <Link
                                              href={localizeHref(link.href)}
                                              className="block rounded-lg px-3 py-2 hover:bg-amber-50 hover:ring-1 hover:ring-amber-200 transition-all"
                                              onClick={() => setMegaMenuOpen(false)}
                                            >
                                              <p className="text-sm font-medium text-gray-900">
                                                {link.name}
                                              </p>
                                              <p className="mt-1 text-sm text-gray-600 leading-snug">
                                                {link.description}
                                              </p>
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* CTA PANEL */}
                            <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400 p-6 text-white shadow-lg">
                              <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-amber-100">
                                  {servicesMenu.cta?.title}
                                </p>
                                <p className="mt-2 text-base text-amber-50">
                                  {servicesMenu.cta?.description}
                                </p>
                              </div>
                              <Link
                                href={localizeHref(servicesMenu.cta?.href ?? '/contact')}
                                className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-white transition"
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
                  className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'text-amber-700' : 'text-gray-700 hover:text-amber-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Dashboard + Language Switcher */}
            <Link
              href={localizeHref(dashboardLink.href)}
              className="text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-md px-3 py-1.5 transition-colors"
            >
              {dashboardLink.name}
            </Link>
            <LanguageSwitcher locale={locale} />
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden space-y-3 overflow-hidden pb-4 pt-2"
            >
              {navigation.map((item) => {
                const localizedHref = localizeHref(item.href);
                return (
                  <Link
                    key={item.key}
                    href={localizedHref}
                    className={`block rounded-md px-3 py-2 text-base font-medium transition ${
                      isActive(item.href)
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={localizeHref(dashboardLink.href)}
                className="block px-3 py-2 text-base font-semibold rounded-md text-white bg-amber-700 hover:bg-amber-800"
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
