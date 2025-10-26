'use client';

import { useState, useRef, type FocusEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu,
  X,
  Mountain,
  ChevronDown,
  Calendar,
  Users,
  Shield,
  Sparkles,
  
} from 'lucide-react';
import { Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

interface HeaderProps {
  locale: Locale;
  translations: any;
}

export default function Header({ locale, translations }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const servicesMenu = translations.nav.servicesMenu;
  const iconComponents = { Calendar, Users, Shield, Sparkles } as const;

  const localizeHref = (href: string) => {
    if (!href || typeof href !== 'string') return href;
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
      megaMenu: !!servicesMenu,
    },
    { key: 'about', label: translations.nav.about, href: '/about' },
    { key: 'contact', label: translations.nav.contact, href: '/contact' },
  ];

  const isActive = (href: string) => {
    const activeHref = (localizeHref(href) ?? '').split('#')[0];
    if (activeHref === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(activeHref);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMegaMenuOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setMegaMenuOpen(false), 400);
  };
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setMegaMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-md">
      <nav className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-amber-500" />
            <span className="text-2xl font-light text-gray-900">Chalet Manager</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) =>
              item.megaMenu ? (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onBlur={handleBlur}
                >
                  <button
                    type="button"
                    className={`flex items-center gap-1 text-sm font-light transition-colors ${
                      isActive(item.href) ? 'text-amber-500' : 'text-gray-700 hover:text-amber-700'
                    }`}
                    aria-expanded={megaMenuOpen}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* FULL-WIDTH MEGA MENU — HEIGHT AUTO ADAPT */}
                  <AnimatePresence>
                    {megaMenuOpen && (
                      <motion.div
                        key="services-mega-menu"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed left-0 top-16 z-50 w-screen overflow-y-auto border-t border-gray-200 bg-white shadow-lg"
                        style={{
                          maxHeight: `calc(100vh - 4rem)`, // 4rem = hauteur du header
                        }}
                      >
                        <div className="mx-auto w-full px-6 py-12 lg:px-12">
                          {/* Titre et intro */}
                          <div className="space-y-10">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                                {servicesMenu.eyebrow}
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-gray-900">
                                {servicesMenu.title}
                              </p>
                              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                {servicesMenu.description}
                              </p>
                            </div>

                            {/* Sections + CTA alignés sur 4 colonnes */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
                              {servicesMenu.sections?.map((section: any, index: number) => {
                                const Icon =
                                  iconComponents[section.icon as keyof typeof iconComponents] ??
                                  Sparkles;
                                return (
                                  <motion.div
                                    key={section.title}
                                    className="rounded-2xl bg-gray-50 p-5 shadow-sm hover:bg-gray-100 transition flex flex-col justify-between"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="rounded-full p-2 text-amber-500 drop-shadow-md">
                                          <Icon className="h-5 w-5" />
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
                                              className="block rounded-lg px-3 py-2 hover:bg-white transition"
                                              onClick={() => setMegaMenuOpen(false)}
                                            >
                                              <p className="text-xs font-medium text-gray-900">
                                                {link.name}
                                              </p>
                                              <p className="mt-1 text-xs text-gray-600">
                                                {link.description}
                                              </p>
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </motion.div>
                                );
                              })}

                              {/* CTA 4ᵉ colonne */}
                              <div className="flex flex-col items-center justify-center text-center rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400 text-white shadow-lg p-8 h-full">
                                <div>
                                  <p
                                    className={`text-2xl text-white tracking-wide ${pacifico.className}`}
                                  >
                                    {servicesMenu.cta?.title}
                                  </p>
                                  <p className="mt-8 text-xs text-amber-50 ">
                                    {servicesMenu.cta?.description}
                                  </p>
                                </div>

                                <Link
                                  href={localizeHref(servicesMenu.cta?.href ?? '/contact')}
                                  className="mt-6 inline-flex items-center justify-center rounded-md bg-white/90 px-6 py-2 text-sm font-light text-amber-500 hover:bg-white transition"
                                  onClick={() => setMegaMenuOpen(false)}
                                >
                                  {servicesMenu.cta?.button}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.key}
                  href={localizeHref(item.href)}
                  className={`text-sm font-light px-2 py-1 transition-colors ${
                    isActive(item.href) ? 'text-amber-500' : 'text-gray-700 hover:text-amber-700'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            <LanguageSwitcher locale={locale} />
          </div>

          {/* Mobile button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-amber-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
       <AnimatePresence>
  {mobileMenuOpen && (
    <motion.div
      key="mobile-menu"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex flex-col backdrop-blur-2xl bg-white/85 dark:bg-neutral-900/80 text-gray-900 dark:text-gray-100 shadow-2xl border border-white/20"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Mountain className="h-7 w-7 text-amber-500" />
          <span className="text-xl font-light">Chalet Manager</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="rounded-lg border border-amber-500/60 p-2 hover:bg-amber-50/60 transition"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5 text-amber-500" />
        </button>
      </div>

      {/* Liens */}
      <div className="flex flex-col space-y-3 p-6 text-lg font-light">
        {navigation.map((item) => (
          <Link
            key={item.key}
            href={localizeHref(item.href)}
            onClick={() => setMobileMenuOpen(false)}
            className={`rounded-md px-4 py-2 transition-colors ${
              isActive(item.href)
                ? 'bg-amber-100/60 text-amber-600 font-medium'
                : 'hover:bg-white/30 text-gray-700 dark:text-gray-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Sélecteur de langue */}
      <div className="mt-auto flex items-center gap-4 border-t border-white/30 px-6 py-4">
      
        <LanguageSwitcher locale={locale} />
      </div>
    </motion.div>
  )}
</AnimatePresence>

      </nav>
    </header>
  );
}
