import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export type DocumentStatus = 'draft' | 'submitted' | 'verified' | 'rejected';

export interface DocumentRecord extends LeanDocumentBase {
  ownerId: string;
  tenantId?: string;
  type: string;
  name: string;
  url: string;
  status: DocumentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const definition: SchemaDefinition<DocumentRecord> = {
  _id: { type: 'string' },
  ownerId: { type: 'string', required: true },
  tenantId: { type: 'string' },
  type: { type: 'string', required: true },
  name: { type: 'string', required: true },
  url: { type: 'string', required: true },
  status: { type: 'string', required: true },
  notes: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const documentSchema = new Schema<DocumentRecord>(definition, { timestamps: true });
documentSchema.index({ ownerId: 1 });
documentSchema.index({ tenantId: 1 });
documentSchema.index({ status: 1 });

documentSchema.index({ createdAt: -1 });

export const DocumentModel = model<DocumentRecord>('documents', documentSchema);
