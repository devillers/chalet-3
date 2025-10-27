import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export interface ApplicationDocument extends LeanDocumentBase {
  propertyId: string;
  tenantId: string;
  ownerId: string;
  status: ApplicationStatus;
  message?: string;
  submittedAt?: Date;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const definition: SchemaDefinition<ApplicationDocument> = {
  _id: { type: 'string' },
  propertyId: { type: 'string', required: true },
  tenantId: { type: 'string', required: true },
  ownerId: { type: 'string', required: true },
  status: { type: 'string', required: true },
  message: { type: 'string' },
  submittedAt: { type: 'date' },
  updatedBy: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const applicationSchema = new Schema<ApplicationDocument>(definition, { timestamps: true });
applicationSchema.index({ propertyId: 1, tenantId: 1 });
applicationSchema.index({ ownerId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

export const ApplicationModel = model<ApplicationDocument>('applications', applicationSchema);
