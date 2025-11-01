// app/api/onboarding/draft/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getOnboardingDraft, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { ownerOnboardingDraftSchema, tenantOnboardingDraftSchema } from '@/lib/validators/onboarding';
import { isPlainObject, sanitizeDraft } from '@/lib/utils/draft';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    console.warn('Tentative de récupération de brouillon sans authentification.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  console.debug('Récupération du brouillon d\'onboarding.', {
    userId: session.user.id,
  });
  const draft = await getOnboardingDraft(session.user.id);
  return NextResponse.json({ draft });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    console.warn('Tentative de sauvegarde de brouillon sans authentification.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    console.error('Le corps de la requête de sauvegarde du brouillon est invalide.');
    return NextResponse.json({ message: 'Corps de requête invalide.' }, { status: 400 });
  }

  if (!isPlainObject(payload)) {
    console.error('La charge utile reçue pour la sauvegarde du brouillon n\'est pas un objet simple.');
    return NextResponse.json({ message: 'Données invalides' }, { status: 400 });
  }

  const sanitized = sanitizeDraft(payload);
  const normalizedPayload = isPlainObject(sanitized) ? sanitized : {};
  const role = session.user.role;
  if (role !== 'OWNER' && role !== 'TENANT') {
    console.error('Rôle utilisateur inattendu lors de la sauvegarde du brouillon.', {
      userId: session.user.id,
      role,
    });
    return NextResponse.json({ message: 'Onboarding non requis.' }, { status: 400 });
  }

  const schema = role === 'OWNER' ? ownerOnboardingDraftSchema : tenantOnboardingDraftSchema;
  const parsed = schema.safeParse(normalizedPayload);
  if (!parsed.success) {
    console.error('Validation du brouillon échouée.', {
      userId: session.user.id,
      role,
      issues: parsed.error.issues,
    });
    return NextResponse.json({ message: 'Données invalides', issues: parsed.error.issues }, { status: 400 });
  }

  console.info('Sauvegarde du brouillon d\'onboarding.', {
    userId: session.user.id,
    role,
    keys: Object.keys(parsed.data ?? {}),
  });
  const draft = await upsertOnboardingDraft(session.user.id, role, parsed.data as Record<string, unknown>);
  console.debug('Brouillon sauvegardé avec succès.', {
    userId: session.user.id,
    draftId: draft?._id?.toString?.(),
  });
  return NextResponse.json({ draft }, { status: 200 });
}
