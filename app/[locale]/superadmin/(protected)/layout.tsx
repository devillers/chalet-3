import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { defaultLocale, Locale } from '@/lib/i18n';

interface LocaleSuperAdminProtectedLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function LocaleSuperAdminProtectedLayout({
  children,
  params,
}: LocaleSuperAdminProtectedLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? defaultLocale;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect(`/${locale}/superadmin/signin?error=restricted`);
  }

  return <div className="min-h-screen bg-slate-50 p-8">{children}</div>;
}
