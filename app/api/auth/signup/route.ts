// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestCsrfToken } from '@/lib/auth/csrf';
import { createUser, getUserByEmail, type UserRole } from '@/lib/db/users';

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  role: z.enum(['OWNER', 'TENANT']),
});

export async function POST(request: Request) {
  const cookieStore = (await import('next/headers')).cookies();
  const ok = validateRequestCsrfToken(request, await cookieStore);
  if (!ok) return NextResponse.json({ message: 'CSRF invalide.' }, { status: 403 });

  let parsed: z.infer<typeof signUpSchema>;
  try {
    parsed = signUpSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: 'Requête invalide.' }, { status: 400 });
  }

  if (parsed.password !== parsed.confirmPassword) {
    return NextResponse.json({ message: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
  }

  const existing = await getUserByEmail(parsed.email.toLowerCase());
  if (existing) return NextResponse.json({ message: 'Un compte existe déjà avec cet email.' }, { status: 409 });

  try {
    const user = await createUser({
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
      role: parsed.role as UserRole,
      onboardingCompleted: true, // ✅ pour autoriser l’accès direct au dashboard
    });
    return NextResponse.json({ id: user._id, email: user.email, role: user.role }, { status: 201 });
  } catch (e) {
    console.error('[signup] failed', e);
    return NextResponse.json({ message: 'Création impossible.' }, { status: 500 });
  }
}
