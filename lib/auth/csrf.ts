import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { env } from '@/env';

type CookieStore = Awaited<ReturnType<typeof import('next/headers')['cookies']>>;

const CSRF_COOKIE_NAME = 'cm_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_MAX_AGE = 60 * 30; // 30 minutes

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const timingSafeCompare = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

export const generateCsrfToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const cookieValue = hashToken(token);

  return { token, cookieValue };
};

export const buildCsrfResponse = () => {
  const { token, cookieValue } = generateCsrfToken();
  const response = NextResponse.json({ token });
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_MAX_AGE,
    path: '/',
  });

  return response;
};

export const validateRequestCsrfToken = (
  request: Request,
  cookieStore: CookieStore,
): boolean => {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return false;
  }

  const storedCookie = cookieStore.get(CSRF_COOKIE_NAME);
  if (!storedCookie?.value) {
    return false;
  }

  const hashedHeader = hashToken(headerToken);
  return timingSafeCompare(storedCookie.value, hashedHeader);
};
