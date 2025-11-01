// lib/db/models/onboarding-draft.ts

import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

// ✅ Document complet retourné par Mongo
export interface OnboardingDraftDocument extends LeanDocumentBase {
  userId: string;
  role: 'OWNER' | 'TENANT';
  data: Record<string, unknown>;
}

// ✅ Helper : type de définition SANS _id (parce que _id est auto-géré par Mongo)
type OnboardingDraftDefinition = Omit<OnboardingDraftDocument, '_id' | 'createdAt' | 'updatedAt'>;

// ✅ Définition du schéma (sans `_id`, sans createdAt/updatedAt)
const definition: SchemaDefinition<OnboardingDraftDefinition> = {
  userId: { type: 'string', required: true },
  role: { type: 'string', required: true },
  data: { type: 'object', default: () => ({}) },
};

// ✅ Génération automatique de _id, createdAt, updatedAt
const onboardingDraftSchema = new Schema<OnboardingDraftDocument>(definition as any, {
  timestamps: true,
});

// ✅ Index unique → 1 seul brouillon par user
onboardingDraftSchema.index({ userId: 1 }, { unique: true });

// ✅ Export final
export const OnboardingDraftModel = model<OnboardingDraftDocument>(
  'onboarding_drafts',
  onboardingDraftSchema
);
