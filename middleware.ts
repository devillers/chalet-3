import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';
import { env } from './env';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
  'dclid',
  'twclid',
  'ttclid',
]);

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // ✅ Ignore les routes API, les assets statiques, etc.
  if (
    nextUrl.pathname.startsWith('/api/') ||
    nextUrl.pathname.startsWith('/_next/') ||
    nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const canonicalUrl = new URL(env.SITE_URL);
  const updatedUrl = new URL(nextUrl.href);
  const requestHost = request.headers.get('host');
  const canonicalHost =
    canonicalUrl.hostname === 'localhost' || canonicalUrl.hostname === '127.0.0.1'
      ? requestHost ?? canonicalUrl.host
      : canonicalUrl.host;
  let shouldRedirect = false;

  // 🚫 Ne force HTTPS et le domaine qu'en production
  if (env.NODE_ENV === 'production') {
    const forwardedProto = request.headers.get('x-forwarded-proto');

    if (forwardedProto && forwardedProto !== 'https') {
      updatedUrl.protocol = 'https:';
      shouldRedirect = true;
    }

    if (canonicalHost && updatedUrl.host !== canonicalHost) {
      updatedUrl.host = canonicalHost;
      shouldRedirect = true;
    }
  }

  // 🧹 Nettoie les slashs finaux
  if (updatedUrl.pathname !== '/' && updatedUrl.pathname.endsWith('/')) {
    updatedUrl.pathname = updatedUrl.pathname.replace(/\/+$/, '');
    shouldRedirect = true;
  }

  // 🔠 Met le path en minuscule
  const lowerCasePath = updatedUrl.pathname.toLowerCase();
  if (updatedUrl.pathname !== lowerCasePath) {
    updatedUrl.pathname = lowerCasePath;
    shouldRedirect = true;
  }

  // 🧹 Supprime les paramètres de tracking UTM
  for (const param of Array.from(updatedUrl.searchParams.keys())) {
    if (TRACKING_PARAMS.has(param.toLowerCase())) {
      updatedUrl.searchParams.delete(param);
      shouldRedirect = true;
    }
  }

  // 🔁 Si une redirection est nécessaire
  if (shouldRedirect) {
    return NextResponse.redirect(updatedUrl, { status: 301 });
  }

  // 🌍 Vérifie si le path contient déjà une locale
  const pathnameHasLocale = locales.some(
    (locale) => updatedUrl.pathname === `/${locale}` || updatedUrl.pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 🌐 Sinon, ajoute la locale par défaut
  const locale = defaultLocale;
  updatedUrl.pathname = `/${locale}${updatedUrl.pathname}`;
  return NextResponse.redirect(updatedUrl);
}

// ✅ Export unique du config (plus d'erreur “Cannot redeclare block-scoped variable”)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.*).*)',
  ],
};
