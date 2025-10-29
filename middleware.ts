import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale, type Locale, getPathWithoutLocale } from './lib/i18n';
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

const PUBLIC_ROUTES = [/^\/$/, /^\/signin$/, /^\/signup$/, /^\/access-denied$/, /^\/superadmin\/signin$/];
const SUPERADMIN_ROUTES = [/^\/superadmin(\/|$)/];
const PROTECTED_ROUTES = [/^\/dashboard(\/|$)/, /^\/account(\/|$)/, /^\/onboarding(\/|$)/];
const OWNER_ONLY_ROUTES = [/^\/dashboard\/owner(\/|$)/];
const TENANT_ONLY_ROUTES = [/^\/dashboard\/tenant(\/|$)/];

const matches = (path: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(path));

const buildRedirectUrl = (request: NextRequest, locale: Locale, pathname: string, searchParams?: Record<string, string>) => {
  const url = new URL(request.url);
  url.pathname = `/${locale}${pathname}`.replace(/\/+/g, '/');
  url.search = '';
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }
  return url;
};

const removeTrackingParams = (url: URL) => {
  let mutated = false;
  for (const param of Array.from(url.searchParams.keys())) {
    if (TRACKING_PARAMS.has(param.toLowerCase())) {
      url.searchParams.delete(param);
      mutated = true;
    }
  }
  return mutated;
};

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  if (
    nextUrl.pathname.startsWith('/api/') ||
    nextUrl.pathname.startsWith('/_next/') ||
    nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const updatedUrl = new URL(nextUrl.href);
  const canonicalUrl = new URL(env.SITE_URL);
  const requestHost = request.headers.get('host');
  const canonicalHost =
    canonicalUrl.hostname === 'localhost' || canonicalUrl.hostname === '127.0.0.1'
      ? requestHost ?? canonicalUrl.host
      : canonicalUrl.host;
  let shouldRedirect = false;

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

  if (updatedUrl.pathname !== '/' && updatedUrl.pathname.endsWith('/')) {
    updatedUrl.pathname = updatedUrl.pathname.replace(/\/+$/, '');
    shouldRedirect = true;
  }

  const lowerCasePath = updatedUrl.pathname.toLowerCase();
  if (updatedUrl.pathname !== lowerCasePath) {
    updatedUrl.pathname = lowerCasePath;
    shouldRedirect = true;
  }

  if (removeTrackingParams(updatedUrl)) {
    shouldRedirect = true;
  }

  const pathname = updatedUrl.pathname;
  const localeSegment = pathname.split('/')[1] as Locale | undefined;
  const hasLocale = localeSegment && locales.includes(localeSegment);

  if (!hasLocale) {
    const redirectUrl = new URL(updatedUrl.href);
    redirectUrl.pathname = `/${defaultLocale}${pathname}`.replace(/\/+/g, '/');
    redirectUrl.search = updatedUrl.search;
    return NextResponse.redirect(redirectUrl, { status: shouldRedirect ? 301 : 307 });
  }

  if (shouldRedirect) {
    return NextResponse.redirect(updatedUrl, { status: 301 });
  }

  const locale = localeSegment ?? defaultLocale;
  const normalizedPath = getPathWithoutLocale(pathname) || '/';

  if (matches(normalizedPath, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });

  if (matches(normalizedPath, SUPERADMIN_ROUTES)) {
    if (!token) {
      console.log('[middleware] superadmin route -> no token', {
        pathname: pathname,
      });
      const callbackUrl = `${updatedUrl.pathname}${updatedUrl.search}`;
      const redirectUrl = buildRedirectUrl(request, locale, '/superadmin/signin', { callbackUrl });
      return NextResponse.redirect(redirectUrl);
    }

    console.log('[middleware] superadmin route -> token', {
      role: token.role,
      pathname: pathname,
    });

    if (token.role !== 'SUPERADMIN') {
      const redirectUrl = buildRedirectUrl(request, locale, '/access-denied', { reason: 'superadmin_only' });
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  if (!matches(normalizedPath, PROTECTED_ROUTES)) {
    return NextResponse.next();
  }

  if (!token) {
    const callbackUrl = `${updatedUrl.pathname}${updatedUrl.search}`;
    const redirectUrl = buildRedirectUrl(request, locale, '/signin', { callbackUrl });
    return NextResponse.redirect(redirectUrl);
  }

  if (token.role === 'SUPERADMIN') {
    const redirectUrl = buildRedirectUrl(request, locale, '/access-denied', { reason: 'superadmin_only' });
    return NextResponse.redirect(redirectUrl);
  }

  const onboardingCompleted = Boolean(token.onboardingCompleted);
  if (!onboardingCompleted && !normalizedPath.startsWith('/onboarding')) {
    const callbackUrl = `${updatedUrl.pathname}${updatedUrl.search}`;
    const redirectUrl = buildRedirectUrl(request, locale, '/onboarding', { callbackUrl });
    return NextResponse.redirect(redirectUrl);
  }

  if (onboardingCompleted && normalizedPath.startsWith('/onboarding')) {
    const destination = token.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/tenant';
    const redirectUrl = buildRedirectUrl(request, locale, destination);
    return NextResponse.redirect(redirectUrl);
  }

  if (matches(normalizedPath, OWNER_ONLY_ROUTES) && token.role !== 'OWNER') {
    const redirectUrl = buildRedirectUrl(request, locale, '/access-denied', { reason: 'owner_only' });
    return NextResponse.redirect(redirectUrl);
  }

  if (matches(normalizedPath, TENANT_ONLY_ROUTES) && token.role !== 'TENANT') {
    const redirectUrl = buildRedirectUrl(request, locale, '/access-denied', { reason: 'tenant_only' });
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.*).*)',
  ],
};
