// lib/db/users.ts
import bcrypt from 'bcryptjs';
import type { LeanDocumentBase } from './mongoose';
import { Schema, model } from './mongoose';

export type UserRole = 'OWNER' | 'TENANT' | 'SUPERADMIN';

export interface IUser extends LeanDocumentBase {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  onboardingCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String }, // généré par le wrapper (crypto.randomUUID)
    name: { type: String, default: '' },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    onboardingCompleted: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

// Index unique email (ton wrapper crée les indexes au premier accès)
UserSchema.index({ email: 1 }, { unique: true });

const User = model<IUser>('users', UserSchema);

export async function getUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email: email.toLowerCase() });
}

export async function createUser(input: {
  name?: string;
  email: string;
  password: string;
  role: UserRole;
  onboardingCompleted?: boolean;
}): Promise<IUser> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  return User.create({
    name: input.name ?? '',
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role,
    onboardingCompleted: !!input.onboardingCompleted,
  });
}

export async function updateUser(id: string, update: Partial<IUser>): Promise<void> {
  await User.findByIdAndUpdate(id, update, { new: true });
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
