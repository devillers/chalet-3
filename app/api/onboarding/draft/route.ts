import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getOnboardingDraft, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { ownerOnboardingSchema, tenantOnboardingSchema } from '@/lib/validators/onboarding';

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

  const payload = await request.json();
  const role = session.user.role;
  if (role !== 'OWNER' && role !== 'TENANT') {
    return NextResponse.json({ message: 'Onboarding non requis.' }, { status: 400 });
  }

  const schema = role === 'OWNER' ? ownerOnboardingSchema : tenantOnboardingSchema;
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Données invalides', issues: parsed.error.issues }, { status: 400 });
  }

  const draft = await upsertOnboardingDraft(session.user.id, role, parsed.data as Record<string, unknown>);
  return NextResponse.json({ draft }, { status: 200 });
}
