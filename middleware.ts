// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale, type Locale } from './lib/i18n';
import { env } from './env';

// ---------- utils
function extractLocale(pathname: string): { hasLocale: boolean; locale: Locale; rest: string } {
  const [, first, ...rest] = pathname.split('/');
  const loc = locales.includes(first as Locale) ? (first as Locale) : defaultLocale;
  const has = locales.includes(first as Locale);
  const restPath = '/' + rest.join('/');
  return { hasLocale: has, locale: loc, rest: restPath === '//' ? '/' : restPath };
}

function withLocale(url: URL, locale: Locale, path: string): URL {
  const next = new URL(url.toString());
  next.pathname = `/${locale}${path}`.replace(/\/+/g, '/');
  return next;
}

// ---------- route guards (simples)
const PUBLIC_PATHS = new Set<string>([
  '/', '/signin', '/signup', '/access-denied', '/superadmin/signin',
]);

const startsWith = (p: string, base: string) => p === base || p.startsWith(base + '/');

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // ignorer assets/api
  if (
    nextUrl.pathname.startsWith('/api/') ||
    nextUrl.pathname.startsWith('/_next/') ||
    nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // locale
  const { hasLocale, locale, rest } = extractLocale(nextUrl.pathname);
  if (!hasLocale) {
    // injecter le préfixe locale et **ne rien changer d’autre**
    const redirectUrl = withLocale(nextUrl, defaultLocale, nextUrl.pathname);
    redirectUrl.search = nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // chemins normalisés (sans toucher à la casse/host/proto pour éviter des 302)
  const path = rest || '/';

  // Public → laisser passer
  if (PUBLIC_PATHS.has(path)) {
    // nettoyer les utm uniquement si présents, sans forcer de 301
    const cleaned = new URL(nextUrl);
    const before = cleaned.toString();
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','msclkid','dclid','twclid','ttclid']
      .forEach(k => cleaned.searchParams.delete(k));
    if (cleaned.toString() !== before) {
      return NextResponse.redirect(cleaned);
    }
    return NextResponse.next();
  }

  // Token (JWT NextAuth)
  const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });

  // SuperAdmin
  if (startsWith(path, '/superadmin')) {
    if (!token) {
      const url = withLocale(nextUrl, locale, '/superadmin/signin');
      url.searchParams.set('callbackUrl', `${nextUrl.pathname}${nextUrl.search}`);
      return NextResponse.redirect(url);
    }
    if ((token as any).role !== 'SUPERADMIN') {
      const url = withLocale(nextUrl, locale, '/access-denied');
      url.searchParams.set('reason', 'superadmin_only');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Zones privées minimales
  const isProtected =
    startsWith(path, '/dashboard') || startsWith(path, '/account') || startsWith(path, '/onboarding');

  if (!isProtected) {
    return NextResponse.next();
  }

  // non connecté → login
  if (!token) {
    const url = withLocale(nextUrl, locale, '/signin');
    url.searchParams.set('callbackUrl', `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // onboarding simple : si pas terminé, redirige vers /onboarding (sinon laisse passer)
  const onboardingCompleted = Boolean((token as any).onboardingCompleted);
  if (!onboardingCompleted && !startsWith(path, '/onboarding')) {
    const url = withLocale(nextUrl, locale, '/onboarding');
    url.searchParams.set('callbackUrl', `${nextUrl.pathname}${nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // pas de contrôle OWNER/TENANT ici : on laisse l'app router faire (ou des guards par page)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.*).*)'],
};
