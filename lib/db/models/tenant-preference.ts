import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export interface TenantPreferenceDocument extends LeanDocumentBase {
  userId: string;
  city?: string;
  capacityMin?: number;
  budgetMax?: number;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const definition: SchemaDefinition<TenantPreferenceDocument> = {
  _id: { type: 'string' },
  userId: { type: 'string', required: true },
  city: { type: 'string' },
  capacityMin: { type: 'number' },
  budgetMax: { type: 'number' },
  amenities: { type: 'array', default: () => [] as string[] },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const tenantPreferenceSchema = new Schema<TenantPreferenceDocument>(definition, { timestamps: true });
tenantPreferenceSchema.index({ userId: 1 });

tenantPreferenceSchema.index({ createdAt: -1 });

export const TenantPreferenceModel = model<TenantPreferenceDocument>('tenant_preferences', tenantPreferenceSchema);
