import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default async function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/superadmin/signin?error=restricted');
  }

  return <div className="min-h-screen bg-slate-50 p-8">{children}</div>;
}
