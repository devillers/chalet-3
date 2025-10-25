import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { redirect } from 'next/navigation';

export type Role = 'superadmin' | 'admin' | 'editor';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/auth/login');
  }
  return session;
}

export async function requireRole(...allowedRoles: Role[]) {
  const session = await requireAuth();
  const userRole = (session.user as any).role as Role;

  if (!allowedRoles.includes(userRole)) {
    redirect('/admin');
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }
  return {
    id: (session.user as any).id,
    email: session.user.email!,
    name: session.user.name!,
    role: (session.user as any).role as Role,
  };
}

export function hasRole(userRole: Role, ...allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canAccessAdminPanel(role: Role): boolean {
  return ['superadmin', 'admin', 'editor'].includes(role);
}

export function canAccessSuperAdmin(role: Role): boolean {
  return role === 'superadmin';
}

export function canManageUsers(role: Role): boolean {
  return role === 'superadmin';
}

export function canEditContent(role: Role): boolean {
  return ['superadmin', 'admin', 'editor'].includes(role);
}
