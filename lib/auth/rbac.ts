// lib/auth/rbac.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { redirect } from 'next/navigation';

export type Role = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'OWNER' | 'TENANT';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/signin');
  return session;
}

export async function requireRole(...allowedRoles: Role[]) {
  const session = await requireAuth();
  const userRole = (session.user as any).role as Role;
  if (!allowedRoles.includes(userRole)) redirect('/access-denied');
  return session;
}

export function hasRole(userRole: Role, ...allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canAccessAdminPanel(role: Role): boolean {
  return ['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(role);
}
export function canAccessSuperAdmin(role: Role): boolean {
  return role === 'SUPERADMIN';
}
export function canManageUsers(role: Role): boolean {
  return role === 'SUPERADMIN';
}
export function canEditContent(role: Role): boolean {
  return ['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(role);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: (session.user as any).id as string,
    email: session.user.email!,
    name: session.user.name!,
    role: (session.user as any).role as Role,
  };
}
