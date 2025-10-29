import { setCsrfCookie } from '@/lib/auth/csrf';

export function GET() {
  return setCsrfCookie();
}
