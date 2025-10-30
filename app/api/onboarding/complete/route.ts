import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { completeOnboarding, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { ownerOnboardingSchema, tenantOnboardingSchema } from '@/lib/validators/onboarding';
import { defaultLocale } from '@/lib/i18n';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    console.warn('Tentative de finalisation de l\'onboarding sans authentification.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== 'OWNER' && role !== 'TENANT') {
    console.error('Rôle utilisateur inattendu lors de la finalisation de l\'onboarding.', {
      userId: session.user.id,
      role,
    });
    return NextResponse.json({ message: 'Onboarding non requis.' }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    console.error('Le corps de la requête de finalisation de l\'onboarding est invalide.');
    return NextResponse.json({ message: 'Corps de requête invalide.' }, { status: 400 });
  }

  const schema = role === 'OWNER' ? ownerOnboardingSchema : tenantOnboardingSchema;
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    console.error('Validation de la finalisation de l\'onboarding échouée.', {
      userId: session.user.id,
      role,
      issues: parsed.error.issues,
    });
    return NextResponse.json({ message: 'Données invalides', issues: parsed.error.issues }, { status: 400 });
  }

  console.info('Finalisation de l\'onboarding.', {
    userId: session.user.id,
    role,
    keys: Object.keys(parsed.data ?? {}),
  });
  const normalizedData = {
    ...parsed.data,
    review: role === 'OWNER'
      ? { status: 'published' as const }
      : { status: 'ready' as const },
  } as Record<string, unknown>;

  const draft = await upsertOnboardingDraft(session.user.id, role, normalizedData);
  console.debug('Brouillon mis à jour avant finalisation.', {
    userId: session.user.id,
    draftId: draft?._id?.toString?.(),
  });
  await completeOnboarding(session.user.id);
  console.info('Onboarding finalisé et brouillon nettoyé.', {
    userId: session.user.id,
  });

  const redirectTo = `/${defaultLocale}/dashboard/${role === 'OWNER' ? 'owner' : 'tenant'}`;

  return NextResponse.json({ draft, redirectTo, onboardingCompleted: true }, { status: 200 });
}
