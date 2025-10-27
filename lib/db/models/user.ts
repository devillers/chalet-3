import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export type UserRole = 'OWNER' | 'TENANT' | 'SUPERADMIN';

export interface UserDocument extends LeanDocumentBase {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  onboardingCompleted?: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const definition: SchemaDefinition<UserDocument> = {
  _id: { type: 'string' },
  email: { type: 'string', required: true },
  name: { type: 'string', required: true },
  role: { type: 'string', required: true },
  passwordHash: { type: 'string', required: true },
  onboardingCompleted: { type: 'boolean' },
  googleId: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const userSchema = new Schema<UserDocument>(definition, { timestamps: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

export const UserModel = model<UserDocument>('users', userSchema);
