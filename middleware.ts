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

  if (nextUrl.pathname.startsWith('/api/') || nextUrl.pathname.startsWith('/_next/') || nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  const canonicalUrl = new URL(env.SITE_URL);
  let shouldRedirect = false;
  const updatedUrl = new URL(nextUrl.href);

  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto && forwardedProto !== 'https') {
    updatedUrl.protocol = 'https:';
    shouldRedirect = true;
  }

  if (updatedUrl.host !== canonicalUrl.host) {
    updatedUrl.host = canonicalUrl.host;
    shouldRedirect = true;
  }

  const pathname = updatedUrl.pathname;
  if (pathname !== '/' && pathname.endsWith('/')) {
    updatedUrl.pathname = pathname.replace(/\/+$/, '');
    shouldRedirect = true;
  }

  const lowerCasePath = updatedUrl.pathname.toLowerCase();
  if (updatedUrl.pathname !== lowerCasePath) {
    updatedUrl.pathname = lowerCasePath;
    shouldRedirect = true;
  }

  for (const param of Array.from(updatedUrl.searchParams.keys())) {
    if (TRACKING_PARAMS.has(param.toLowerCase())) {
      updatedUrl.searchParams.delete(param);
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    return NextResponse.redirect(updatedUrl, { status: 301 });
  }

  const pathnameHasLocale = locales.some(
    (locale) => updatedUrl.pathname === `/${locale}` || updatedUrl.pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = defaultLocale;
  updatedUrl.pathname = `/${locale}${updatedUrl.pathname}`;
  return NextResponse.redirect(updatedUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.*).*)'],
};
