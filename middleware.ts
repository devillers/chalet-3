import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                         request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = defaultLocale;
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|data|.*\\..*).*)'],
};
