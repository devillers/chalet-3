import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export interface OwnerProfileDocument extends LeanDocumentBase {
  userId: string;
  phone?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ownerDefinition: SchemaDefinition<OwnerProfileDocument> = {
  _id: { type: 'string' },
  userId: { type: 'string', required: true },
  phone: { type: 'string' },
  companyName: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const ownerProfileSchema = new Schema<OwnerProfileDocument>(ownerDefinition, { timestamps: true });
ownerProfileSchema.index({ userId: 1 }, { unique: true });

export const OwnerProfileModel = model<OwnerProfileDocument>('owner_profiles', ownerProfileSchema);

export interface TenantProfileDocument extends LeanDocumentBase {
  userId: string;
  phone?: string;
  occupation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const tenantDefinition: SchemaDefinition<TenantProfileDocument> = {
  _id: { type: 'string' },
  userId: { type: 'string', required: true },
  phone: { type: 'string' },
  occupation: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const tenantProfileSchema = new Schema<TenantProfileDocument>(tenantDefinition, { timestamps: true });
tenantProfileSchema.index({ userId: 1 }, { unique: true });

export const TenantProfileModel = model<TenantProfileDocument>('tenant_profiles', tenantProfileSchema);
