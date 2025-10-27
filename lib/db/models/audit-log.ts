import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export interface AuditLogDocument extends LeanDocumentBase {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const definition: SchemaDefinition<AuditLogDocument> = {
  _id: { type: 'string' },
  actorId: { type: 'string', required: true },
  action: { type: 'string', required: true },
  entity: { type: 'string', required: true },
  entityId: { type: 'string' },
  metadata: { type: 'object' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const auditLogSchema = new Schema<AuditLogDocument>(definition, { timestamps: true });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ createdAt: -1 });

auditLogSchema.index({ action: 'text', entity: 'text' } as Record<string, 'text'>);

export const AuditLogModel = model<AuditLogDocument>('audit_logs', auditLogSchema);
