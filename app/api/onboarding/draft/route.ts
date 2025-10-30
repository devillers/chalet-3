import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getOnboardingDraft, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { ownerOnboardingDraftSchema, tenantOnboardingDraftSchema } from '@/lib/validators/onboarding';
import { isPlainObject, sanitizeDraft } from '@/lib/utils/draft';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const draft = await getOnboardingDraft(session.user.id);
  return NextResponse.json({ draft });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Corps de requête invalide.' }, { status: 400 });
  }

  if (!isPlainObject(payload)) {
    return NextResponse.json({ message: 'Données invalides' }, { status: 400 });
  }

  const sanitized = sanitizeDraft(payload);
  const normalizedPayload = isPlainObject(sanitized) ? sanitized : {};
  const role = session.user.role;
  if (role !== 'OWNER' && role !== 'TENANT') {
    return NextResponse.json({ message: 'Onboarding non requis.' }, { status: 400 });
  }

  const schema = role === 'OWNER' ? ownerOnboardingDraftSchema : tenantOnboardingDraftSchema;
  const parsed = schema.safeParse(normalizedPayload);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Données invalides', issues: parsed.error.issues }, { status: 400 });
  }

  const draft = await upsertOnboardingDraft(session.user.id, role, parsed.data as Record<string, unknown>);
  return NextResponse.json({ draft }, { status: 200 });
}
