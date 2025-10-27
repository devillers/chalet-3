import { NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/validators/sign-up';
import { createUser, getUserByEmail } from '@/lib/db/users';

export async function POST(request: Request) {
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

  return NextResponse.json({ message: 'Compte créé' }, { status: 201 });
}
