// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
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
  // ✅ cookies() est async dans ton setup → on l'attend
  const cookieStore = await cookies();

  const ok = validateRequestCsrfToken(request, cookieStore);
  if (!ok) {
    return NextResponse.json({ message: 'CSRF invalide.' }, { status: 403 });
  }

  let parsed: z.infer<typeof signUpSchema>;
  try {
    parsed = signUpSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: 'Requête invalide.' }, { status: 400 });
  }

  if (parsed.password !== parsed.confirmPassword) {
    return NextResponse.json({ message: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
  }

  const email = parsed.email.toLowerCase();

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ message: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  try {
    const user = await createUser({
      name: parsed.name,
      email,
      password: parsed.password,
      role: parsed.role as UserRole,
      onboardingCompleted: true, // ou false si tu veux forcer /onboarding
    });

    return NextResponse.json(
      { id: user._id, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (e) {
    console.error('[signup] failed', e);
    return NextResponse.json({ message: 'Création impossible.' }, { status: 500 });
  }
}