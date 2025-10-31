// app/api/onboarding/complete/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { completeOnboarding, upsertOnboardingDraft } from '@/lib/db/onboarding';
import { upsertOwnerProfile, upsertTenantProfile } from '@/lib/db/users';
import { upsertTenantPreferences } from '@/lib/db/tenant-preferences';
import {
  ownerOnboardingSchema,
  tenantOnboardingSchema,
  type OwnerOnboardingInput,
  type TenantOnboardingInput,
} from '@/lib/validators/onboarding';
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

  // ✅ CORRECTION 1: S'assurer que TOUTES les données sont sauvegardées dans le draft
  const normalizedData = {
    ...parsed.data,
    review: role === 'OWNER'
      ? { status: 'published' as const }
      : { status: 'ready' as const },
  } as Record<string, unknown>;

  // ✅ Sauvegarder le draft complet AVANT la création de la propriété
  const draft = await upsertOnboardingDraft(session.user.id, role, normalizedData);
  console.debug('Brouillon mis à jour avant finalisation.', {
    userId: session.user.id,
    draftId: draft?._id?.toString?.(),
    hasSeason: !!(parsed.data as any).season,
    hasPhotos: !!((parsed.data as any).photos?.length),
    hasPricing: !!(parsed.data as any).pricing,
  });

  let redirectTo = `/${defaultLocale}/dashboard/${role === 'OWNER' ? 'owner' : 'tenant'}`;
  let propertySummary: { id: string; slug: string } | null = null;

  // ✅ CORRECTION 2: Gérer la création de propriété pour les propriétaires
  if (role === 'OWNER') {
    const ownerData = parsed.data as OwnerOnboardingInput;
    const prop = ownerData.property!;
    const photos = ownerData.photos ?? [];
    const season = ownerData.season;
    const pricing = ownerData.pricing;
    const compliance = ownerData.compliance;

    // ✅ Validation : au moins une photo requise
    if (photos.length === 0) {
      console.warn("Publication du logement refusée : aucune photo fournie.", {
        userId: session.user.id,
      });
      return NextResponse.json({ 
        message: 'Ajoutez au moins une photo avant de publier.' 
      }, { status: 400 });
    }

    // ✅ Vérifier si une propriété existe déjà pour cet utilisateur
    const existing = await PropertyModel.findOne({ ownerId: session.user.id });
    const slug = await ensureUniqueSlug(prop.title, existing?._id);
    
    // ✅ Identifier la photo hero
    const hero = photos.find((p) => p.isHero) ?? photos[0];

    // ✅ Formater les images pour MongoDB
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

    // ✅ CORRECTION 3: Inclure TOUS les champs dans la création/mise à jour
    const propertyData = {
      title: prop.title,
      slug,
      status: 'published' as const,
      publishedAt: existing?.publishedAt ?? new Date(),
      ownerId: session.user.id,
      regNumber: prop.regNumber ?? '',
      capacity: prop.capacity,
      images,
      heroImageId: hero?.publicId,
      address: {
        city: prop.city,
      },
      // ✅ Ajouter la saisonnalité
      seasonalPeriod: season 
        ? { start: new Date(season.start), end: new Date(season.end) }
        : undefined,
      // ✅ Ajouter les tarifs
      pricing: pricing 
        ? { nightly: pricing.nightly, cleaningFee: pricing.cleaningFee }
        : undefined,
      // ✅ Ajouter la conformité
      compliance: compliance
        ? { hasInsurance: compliance.hasInsurance, acceptsTerms: compliance.acceptsTerms }
        : undefined,
      externalCalendars: existing?.externalCalendars ?? [],
      blocks: existing?.blocks ?? [],
      previousSlugs: existing 
        ? Array.from(
            new Set([
              ...(existing.previousSlugs ?? []),
              ...(existing.slug !== slug ? [existing.slug] : []),
            ]),
          )
        : [],
    };

    let propertyDocument;

    if (existing) {
      // ✅ Mise à jour de la propriété existante
      console.info('Mise à jour de la propriété existante.', {
        userId: session.user.id,
        propertyId: existing._id,
        photosCount: images.length,
      });
      
      propertyDocument = await PropertyModel.findByIdAndUpdate(
        existing._id,
        propertyData,
        { new: true },
      );
    } else {
      // ✅ Création d'une nouvelle propriété
      console.info('Création d\'une nouvelle propriété.', {
        userId: session.user.id,
        photosCount: images.length,
      });
      
      propertyDocument = await PropertyModel.create(propertyData);
    }

    if (!propertyDocument) {
      console.error('Création ou mise à jour de la propriété échouée.', {
        userId: session.user.id,
      });
      return NextResponse.json({ 
        message: 'Impossible de sauvegarder la propriété.' 
      }, { status: 500 });
    }

    // ✅ CORRECTION 4: Mettre à jour le profil utilisateur avec la propriété
    await upsertOwnerProfile(session.user.id, ownerData.profile, propertyDocument._id);

    propertySummary = {
      id: propertyDocument._id,
      slug: propertyDocument.slug,
    };
    
    redirectTo = `/${defaultLocale}/portfolio/${propertyDocument.slug}`;
    
    console.info('Propriété créée/mise à jour avec succès.', {
      userId: session.user.id,
      propertyId: propertyDocument._id,
      slug: propertyDocument.slug,
      photosCount: images.length,
      hasSeason: !!propertyDocument.seasonalPeriod,
      hasPricing: !!propertyDocument.pricing,
    });
  } else {
    // ✅ Gestion du profil locataire
    const tenantData = parsed.data as TenantOnboardingInput;

    await upsertTenantProfile(session.user.id, tenantData.profile);

    await upsertTenantPreferences(session.user.id, {
      city: tenantData.search.city,
      capacityMin: tenantData.search.capacity,
      budgetMax: tenantData.preferences?.budget,
      amenities: tenantData.preferences?.amenities ?? [],
    });
  }

  // ✅ CORRECTION 5: Marquer l'onboarding comme complété et nettoyer le draft
  await completeOnboarding(session.user.id);
  
  console.info('Onboarding finalisé et brouillon nettoyé.', {
    userId: session.user.id,
  });

  return NextResponse.json(
    { 
      draft, 
      redirectTo, 
      onboardingCompleted: true, 
      property: propertySummary 
    },
    { status: 200 },
  );
}