// lib/db/models/onboarding-draft.ts

import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

// Document complet renvoyé par Mongo (timestamps gérés par le schéma)
export interface OnboardingDraftDocument extends LeanDocumentBase {
  userId: string;
  role: 'OWNER' | 'TENANT';
  data: Record<string, unknown>;
}

// Définition sans champs auto-gérés
type OnboardingDraftDefinition = Omit<
  OnboardingDraftDocument,
  '_id' | 'createdAt' | 'updatedAt'
>;

const definition: SchemaDefinition<OnboardingDraftDefinition> = {
  userId: { type: 'string', required: true },
  role:   { type: 'string', required: true },
  data:   { type: 'object', default: () => ({}) },
};

// ⚠ Ton wrapper n’accepte que quelques options → on garde uniquement timestamps
const onboardingDraftSchema = new Schema<OnboardingDraftDocument>(definition as any, {
  timestamps: true,
});

// 1 brouillon par user ET par rôle
onboardingDraftSchema.index({ userId: 1, role: 1 }, { unique: true });

// NB: ton wrapper ne supportant pas l’option { collection }, on passe
// comme "model name" le nom exact souhaité pour éviter toute pluralisation.
export const OnboardingDraftModel = model<OnboardingDraftDocument>(
  'onboarding_drafts',
  onboardingDraftSchema
);
