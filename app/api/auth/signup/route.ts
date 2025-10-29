import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signUpSchema } from '@/lib/validators/sign-up';
import { createUser, getUserByEmail } from '@/lib/db/users';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rateLimit';
import { validateRequestCsrfToken } from '@/lib/auth/csrf';

export async function POST(request: Request) {
  const identifier =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'signup-global';
  const rateLimitKey = `signup:${identifier}`;
  const rateStatus = checkRateLimit(rateLimitKey);
  if (!rateStatus.allowed) {
    return NextResponse.json(
      { message: `Trop de tentatives. Réessayez dans ${rateStatus.retryAfter ?? 60}s.` },
      { status: 429 },
    );
  }

  const cookieStore = await cookies();
  if (!validateRequestCsrfToken(request, cookieStore)) {
    return NextResponse.json({ message: 'Jeton CSRF manquant ou invalide.' }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = signUpSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ message: 'Données invalides', issues: parsed.error.issues }, { status: 400 });
  }

  const { email, password, name, role } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ message: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  await createUser({ name, email, password, role });
  resetRateLimit(rateLimitKey);

  return NextResponse.json({ message: 'Compte créé' }, { status: 201 });
}
