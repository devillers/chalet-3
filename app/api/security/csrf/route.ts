import { buildCsrfResponse } from '@/lib/auth/csrf';

export function GET() {
  return buildCsrfResponse();
}
