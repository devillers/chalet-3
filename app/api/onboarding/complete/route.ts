import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { completeOnboarding, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { upsertOwnerProfile } from '@/lib/db/users';
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

async function ensureUniqueSlug(title: string, currentId?: string): Promise<string> {
  const slug = slugify(title);
  const existing = await PropertyModel.findOne({ slug });
  if (!existing) return slug;
  if (currentId && existing._id === currentId) {
    return slug;
  }
  return `${slug}-${Date.now().toString(36)}`;
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
  let redirectTo = `/${defaultLocale}/dashboard/${role === 'OWNER' ? 'owner' : 'tenant'}`;
  let propertySummary: { id: string; slug: string } | null = null;

  if (role === 'OWNER') {
    const ownerData = parsed.data as OwnerOnboardingInput;
    const prop = ownerData.property!;
    const photos = ownerData.photos ?? [];
    const season = ownerData.season;

    if (photos.length === 0) {
      console.warn("Publication du logement refusée : aucune photo fournie.", {
        userId: session.user.id,
      });
      return NextResponse.json({ message: 'Ajoutez au moins une photo avant de publier.' }, { status: 400 });
    }

    const existing = await PropertyModel.findOne({ ownerId: session.user.id });
    const slug = await ensureUniqueSlug(prop.title, existing?._id);
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

    const pricing = ownerData.pricing
      ? { nightly: ownerData.pricing.nightly, cleaningFee: ownerData.pricing.cleaningFee }
      : undefined;
    const compliance = ownerData.compliance
      ? { hasInsurance: ownerData.compliance.hasInsurance, acceptsTerms: ownerData.compliance.acceptsTerms }
      : undefined;

    const previousSlugs = existing
      ? Array.from(
          new Set([
            ...(existing.previousSlugs ?? []),
            ...(existing.slug !== slug ? [existing.slug] : []),
          ]),
        )
      : [];

    const propertyDocument = existing
      ? await PropertyModel.findByIdAndUpdate(
          existing._id,
          {
            title: prop.title,
            slug,
            previousSlugs,
            status: 'published',
            publishedAt: existing.publishedAt ?? new Date(),
            ownerId: session.user.id,
            regNumber: prop.regNumber ?? existing.regNumber,
            capacity: prop.capacity ?? existing.capacity,
            images,
            heroImageId: hero?.publicId ?? existing.heroImageId,
            seasonalPeriod: season
              ? { start: new Date(season.start), end: new Date(season.end) }
              : existing.seasonalPeriod,
            address: {
              ...(existing.address ?? {}),
              city: prop.city,
            },
            pricing: pricing ?? existing.pricing,
            compliance: compliance ?? existing.compliance,
          },
          { new: true },
        )
      : await PropertyModel.create({
          title: prop.title,
          slug,
          previousSlugs,
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
          seasonalPeriod: season ? { start: new Date(season.start), end: new Date(season.end) } : undefined,
          pricing,
          compliance,
        });

    if (!propertyDocument) {
      console.error('Création ou mise à jour de la propriété échouée.', {
        userId: session.user.id,
      });
      return NextResponse.json({ message: 'Impossible de sauvegarder la propriété.' }, { status: 500 });
    }

    await upsertOwnerProfile(session.user.id, ownerData.profile, propertyDocument._id);

    propertySummary = {
      id: propertyDocument._id,
      slug: propertyDocument.slug,
    };
    redirectTo = `/${defaultLocale}/portfolio/${propertyDocument.slug}`;
  }

  await completeOnboarding(session.user.id);
  console.info('Onboarding finalisé et brouillon nettoyé.', {
    userId: session.user.id,
  });

  return NextResponse.json(
    { draft, redirectTo, onboardingCompleted: true, property: propertySummary },
    { status: 200 },
  );
}
