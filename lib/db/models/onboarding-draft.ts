import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export interface OnboardingDraftDocument extends LeanDocumentBase {
  userId: string;
  role: 'OWNER' | 'TENANT';
  data: Record<string, unknown>;
}

const definition: SchemaDefinition<OnboardingDraftDocument> = {
  _id: { type: 'string' },
  userId: { type: 'string', required: true },
  role: { type: 'string', required: true },
  data: { type: 'object', default: () => ({}) as Record<string, unknown> },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const onboardingDraftSchema = new Schema<OnboardingDraftDocument>(definition, { timestamps: true });
onboardingDraftSchema.index({ userId: 1 }, { unique: true });
onboardingDraftSchema.index({ role: 1 });

export const OnboardingDraftModel = model<OnboardingDraftDocument>('onboarding_drafts', onboardingDraftSchema);

