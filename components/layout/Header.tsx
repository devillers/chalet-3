'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, LayoutDashboard, Image as ImageIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import LanguageSwitcher from './LanguageSwitcher';
import type { Locale } from '@/lib/i18n';

interface HeaderProps {
  locale: Locale;
  translations: Record<string, unknown>;
}

interface NavLink {
  href: string;
  label: string;
  auth?: boolean;
  roles?: Array<'OWNER' | 'TENANT' | 'SUPERADMIN'>;
  id: string;
  ariaLabel?: string;
}

export default function Header({ locale, translations }: HeaderProps) {
  const pathname = usePathname();
  const session = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = (key: string, fallback: string) =>
    (translations?.[key] as string | undefined) ?? fallback;

  const role = session.data?.user.role;

  const publicLinks: NavLink[] = [
    { id: 'portfolio', href: '/portfolio', label: t('nav.portfolio', 'Portfolio') },
    { id: 'signin', href: '/signin', label: t('nav.signin', 'Se connecter'), auth: false },
    { id: 'signup', href: '/signup', label: t('nav.signup', 'Créer un compte'), auth: false },
  ];

  const ownerTenantLinks: NavLink[] = [
    { id: 'portfolio', href: '/portfolio', label: t('nav.portfolio', 'Portfolio') },
    {
      id: 'dashboard',
      href: role === 'TENANT' ? '/dashboard/tenant' : '/dashboard/owner',
      label: t('nav.dashboard', 'Tableau de bord'),
      auth: true,
      roles: ['OWNER', 'TENANT'],
    },
    {
      id: 'account',
      href: '/account',
      label: t('nav.account', 'Compte'),
      auth: true,
      roles: ['OWNER', 'TENANT'],
    },
  ];

  const superadminLinks: NavLink[] = [
    { id: 'portfolio', href: '/portfolio', label: t('nav.portfolio', 'Portfolio') },
    {
      id: 'superadmin',
      href: '/superadmin',
      label: t('nav.superadmin', 'Console SuperAdmin'),
      roles: ['SUPERADMIN'],
      auth: true,
    },
  ];

  const computedLinks = useMemo(() => {
    if (!session.data) {
      return publicLinks;
    }
    if (role === 'SUPERADMIN') {
      const accountLink: NavLink = {
        id: 'account', 
        href: '/account',
        label: t('nav.account', 'Compte'),
        roles: ['SUPERADMIN'],
        auth: true,
      };
      return [...superadminLinks, accountLink];
    }
    return ownerTenantLinks;
  }, [session.data, role, ownerTenantLinks, superadminLinks, publicLinks]);

  const linkShouldRender = (link: NavLink): boolean => {
    if (!session.data && link.auth) {
      return false;
    }
    if (session.data && (link.id === 'signin' || link.id === 'signup')) {
      return false;
    }
    if (link.roles && role && !link.roles.includes(role)) {
      return false;
    }
    if (link.roles && !role) {
      return false;
    }
    return true;
  };

  const localizedHref = (href: string) => {
    if (!href.startsWith('/')) {
      return href;
    }
    if (href === '/') {
      return `/${locale}`;
    }
    return `/${locale}${href}`;
  };

  const isActive = (href: string) => {
    const localized = localizedHref(href);
    return pathname === localized || pathname.startsWith(`${localized}/`);
  };

  const desktopLinks = computedLinks.filter(linkShouldRender);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: localizedHref('/portfolio') });
  };

  const mobileLinks = desktopLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-lg font-semibold">
          <ImageIcon className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Chalet Manager</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label={t('nav.primary', 'Navigation principale')}>
          {desktopLinks.map((link) => (
            <Link
              key={link.id}
              href={localizedHref(link.href)}
              aria-label={link.ariaLabel ?? link.label}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
          {session.data ? (
            <Button variant="ghost" className="text-sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('nav.signout', 'Se déconnecter')}
            </Button>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('nav.mobileMenu', 'Ouvrir le menu')}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{t('nav.mobileTitle', 'Menu')}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-3">
                {mobileLinks.map((link) => (
                  <Link
                    key={`mobile-${link.id}`}
                    href={localizedHref(link.href)}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className="rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </Link>
                ))}
                {session.data ? (
                  <>
                    <Separator />
                    <Button onClick={handleSignOut} variant="secondary" className="justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.signout', 'Se déconnecter')}
                    </Button>
                    {role === 'SUPERADMIN' ? (
                      <Link
                        href={localizedHref('/superadmin')}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4" /> {t('nav.superadmin', 'Console SuperAdmin')}
                      </Link>
                    ) : null}
                  </>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
