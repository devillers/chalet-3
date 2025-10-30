import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { completeOnboarding, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { ownerOnboardingSchema, tenantOnboardingSchema } from '@/lib/validators/onboarding';
import { defaultLocale } from '@/lib/i18n';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== 'OWNER' && role !== 'TENANT') {
    return NextResponse.json({ message: 'Onboarding non requis.' }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Corps de requête invalide.' }, { status: 400 });
  }

  const schema = role === 'OWNER' ? ownerOnboardingSchema : tenantOnboardingSchema;
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Données invalides', issues: parsed.error.issues }, { status: 400 });
  }

  const normalizedData = {
    ...parsed.data,
    review: role === 'OWNER'
      ? { status: 'published' as const }
      : { status: 'ready' as const },
  } as Record<string, unknown>;

  const draft = await upsertOnboardingDraft(session.user.id, role, normalizedData);
  await completeOnboarding(session.user.id);

  const redirectTo = `/${defaultLocale}/dashboard/${role === 'OWNER' ? 'owner' : 'tenant'}`;

  return NextResponse.json({ draft, redirectTo, onboardingCompleted: true }, { status: 200 });
}
