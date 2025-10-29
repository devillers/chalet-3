// lib/auth/csrf.ts
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/env';

const CSRF_COOKIE_NAME = 'cm_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_MAX_AGE = 60 * 30; // 30 minutes

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const timingSafeCompare = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;

  return crypto.timingSafeEqual(
    new Uint8Array(aBuffer),
    new Uint8Array(bBuffer)
  );
};

export const generateCsrfToken = (): { token: string; cookieValue: string } => {
  const token = crypto.randomBytes(32).toString('hex');
  const cookieValue = hashToken(token);
  return { token, cookieValue };
};

export const setCsrfCookie = (): NextResponse => {
  const { token, cookieValue } = generateCsrfToken();
  const response = NextResponse.json(
    { csrfToken: token },
    {
      headers: {
        // Preserve the header consumers might rely on to read the token
        [CSRF_HEADER_NAME]: token,
      },
    }
  );

  response.cookies.set(CSRF_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_MAX_AGE,
  });
  return response;
};

/**
 * Validate CSRF token from request cookies/headers
 */
export const validateCsrfToken = async (): Promise<boolean> => {
  const cookieStore = await cookies(); // 👈 obligatoire maintenant
  const cookieValue = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerValue = cookieStore.get(CSRF_HEADER_NAME)?.value;

  if (!cookieValue || !headerValue) return false;

  const hashedHeaderToken = hashToken(headerValue);
  return timingSafeCompare(cookieValue, hashedHeaderToken);
};
