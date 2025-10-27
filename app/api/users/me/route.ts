import { NextResponse } from 'next/server';
import { notImplemented, requireSession } from '@/lib/api/response';

export async function GET() {
  const { session, response } = await requireSession();
  if (response) {
    return response;
  }
  return NextResponse.json({ user: session.user });
}

export async function PUT() {
  const { response } = await requireSession();
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour du profil utilisateur non implémentée.');
}

export async function DELETE() {
  const { response } = await requireSession();
  if (response) {
    return response;
  }
  return notImplemented('Suppression de compte non implémentée.');
}
