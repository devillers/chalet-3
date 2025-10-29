
// app/api/auth/csrf/route.ts
import { setCsrfCookie } from '@/lib/auth/csrf';

export function GET() {
  return setCsrfCookie();
}
