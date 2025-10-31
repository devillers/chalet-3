import { z } from 'zod';

const baseProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis'),
  lastName: z.string().trim().min(1, 'Nom requis'),
  // Accept empty string as undefined, but validate if present
  phone: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().min(6, 'Téléphone invalide').optional(),
  ),
});

export const ownerOnboardingSchema = z.object({
  profile: baseProfileSchema,
  property: z.object({
    title: z.string().trim().min(3, 'Nom du logement trop court'),
    city: z.string().trim().min(2, 'Ville trop courte'),
    capacity: z.number().min(1, 'Capacité minimale 1'),
    description: z.string().trim().optional(),
    regNumber: z.string().trim().optional(),
  }), // required
  photos: z
    .array(
      z.object({
        publicId: z.string(),
        url: z.string().url(),
        alt: z.string().optional(),
        isHero: z.boolean(),
        width: z.number().min(0).optional(),
        height: z.number().min(0).optional(),
        format: z.string().optional(),
        bytes: z.number().min(0).optional(),
      }),
    )
    .optional(),
  season: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  pricing: z
    .object({
      nightly: z.number().min(0),
      cleaningFee: z.number().min(0).optional(),
    })
    .optional(),
  compliance: z
    .object({
      hasInsurance: z.boolean().optional(),
      acceptsTerms: z.boolean(),
    })
    .optional(),
  review: z.object({ status: z.enum(['draft', 'published']) }).optional(),
});

export const tenantOnboardingSchema = z.object({
  profile: baseProfileSchema,
  search: z.object({ city: z.string().trim().min(2, 'Ville trop courte'), capacity: z.number().min(1, 'Capacité minimale 1') }),
  documents: z.array(z.object({ name: z.string(), url: z.string().url() })).optional(),
  preferences: z
    .object({
      amenities: z.array(z.string()).default([]),
      budget: z.number().min(0).optional(),
    })
    .optional(),
  review: z.object({ status: z.enum(['draft', 'ready']) }).optional(),
});

export type OwnerOnboardingInput = z.infer<typeof ownerOnboardingSchema>;
export type TenantOnboardingInput = z.infer<typeof tenantOnboardingSchema>;

export const ownerOnboardingDraftSchema = ownerOnboardingSchema.deepPartial();
export const tenantOnboardingDraftSchema = tenantOnboardingSchema.deepPartial();

export type OwnerOnboardingDraftInput = z.infer<typeof ownerOnboardingDraftSchema>;
export type TenantOnboardingDraftInput = z.infer<typeof tenantOnboardingDraftSchema>;
