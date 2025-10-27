import bcrypt from 'bcryptjs';
import { connectMongo } from './mongoose';
import { UserModel, type UserDocument, type UserRole } from './models/user';

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'SUPERADMIN'> | 'SUPERADMIN';
  onboardingCompleted?: boolean;
  googleId?: string;
}): Promise<UserDocument> {
  await connectMongo();
  const passwordHash = await bcrypt.hash(data.password, 12);
  return UserModel.create({
    name: data.name,
    email: data.email.toLowerCase(),
    role: data.role,
    passwordHash,
    onboardingCompleted: data.onboardingCompleted,
    googleId: data.googleId,
  });
}

export async function getUserById(id: string): Promise<UserDocument | null> {
  await connectMongo();
  return UserModel.findById(id);
}

export async function getUserByEmail(email: string): Promise<UserDocument | null> {
  await connectMongo();
  return UserModel.findOne({ email: email.toLowerCase() });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<UserDocument, 'name' | 'onboardingCompleted' | 'passwordHash' | 'role'>>
): Promise<UserDocument | null> {
  await connectMongo();
  return UserModel.findByIdAndUpdate(id, updates, { new: true });
}

export async function listUsers(filter?: Partial<Pick<UserDocument, 'role'>>): Promise<UserDocument[]> {
  await connectMongo();
  return UserModel.find(filter);
}
