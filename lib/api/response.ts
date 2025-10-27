import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function requireSession(roles?: Array<'OWNER' | 'TENANT' | 'SUPERADMIN'>) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) } as const;
  }
  if (roles && !roles.includes(session.user.role)) {
    return {
      session: null,
      response: NextResponse.json({ message: 'Accès refusé' }, { status: 403 }),
    } as const;
  }
  return { session, response: null } as const;
}

export function notImplemented(message: string) {
  return NextResponse.json({ message }, { status: 501 });
}
