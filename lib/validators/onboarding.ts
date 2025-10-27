import { z } from 'zod';

const baseProfileSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().min(6).optional(),
});

export const ownerOnboardingSchema = z.object({
  profile: baseProfileSchema,
  property: z
    .object({
      title: z.string().min(3),
      city: z.string().min(2),
      capacity: z.number().min(1),
      regNumber: z.string().optional(),
    })
    .optional(),
  photos: z
    .array(
      z.object({
        publicId: z.string(),
        url: z.string().url(),
        alt: z.string().optional(),
        isHero: z.boolean(),
      })
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
  search: z.object({ city: z.string().min(2), capacity: z.number().min(1) }).optional(),
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
