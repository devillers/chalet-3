import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { completeOnboarding, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { ownerOnboardingSchema, tenantOnboardingSchema, type OwnerOnboardingInput } from '@/lib/validators/onboarding';
import { defaultLocale } from '@/lib/i18n';
import { PropertyModel } from '@/lib/db/models/property';

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .replace(/--+/g, '-');
}

async function ensureUniqueSlug(base: string): Promise<string> {
  const slug = slugify(base);
  const existing = await PropertyModel.findOne({ slug });
  if (!existing) return slug;
  const candidate = `${slug}-${Date.now().toString(36)}`;
  return candidate;
}

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
  // If owner: create or update a Property based on onboarding data
  if (role === 'OWNER') {
    const ownerData = parsed.data as OwnerOnboardingInput;
    const prop = ownerData.property!;
    const photos = ownerData.photos ?? [];
    const season = ownerData.season;

    const slug = await ensureUniqueSlug(prop.title);
    const hero = photos.find((p) => p.isHero) ?? photos[0];

    const images = photos.map((p) => ({
      publicId: p.publicId,
      url: p.url,
      width: p.width ?? 0,
      height: p.height ?? 0,
      format: p.format ?? 'auto',
      bytes: p.bytes ?? 0,
      alt: p.alt,
      isHero: Boolean(p.isHero),
    }));

    const existing = await PropertyModel.findOne({ slug });
    if (existing) {
      await PropertyModel.findByIdAndUpdate(
        existing._id,
        {
          title: prop.title,
          slug,
          status: 'published',
          publishedAt: existing.publishedAt ?? new Date(),
          ownerId: session.user.id,
          regNumber: prop.regNumber ?? existing.regNumber,
          capacity: prop.capacity ?? existing.capacity,
          images,
          heroImageId: hero?.publicId ?? existing.heroImageId,
          seasonalPeriod: season ? { start: new Date(season.start), end: new Date(season.end) } : existing.seasonalPeriod,
          address: {
            ...(existing.address ?? {}),
            city: prop.city,
          },
        },
        { new: true },
      );
    } else {
      await PropertyModel.create({
        title: prop.title,
        slug,
        previousSlugs: [],
        status: 'published',
        publishedAt: new Date(),
        ownerId: session.user.id,
        regNumber: prop.regNumber ?? '',
        capacity: prop.capacity,
        images,
        address: { city: prop.city },
        externalCalendars: [],
        blocks: [],
        heroImageId: hero?.publicId,
      });
    }
  }

  await completeOnboarding(session.user.id);
  console.info('Onboarding finalisé et brouillon nettoyé.', {
    userId: session.user.id,
  });

  const redirectTo = `/${defaultLocale}/dashboard/${role === 'OWNER' ? 'owner' : 'tenant'}`;

  return NextResponse.json({ draft, redirectTo, onboardingCompleted: true }, { status: 200 });
}
