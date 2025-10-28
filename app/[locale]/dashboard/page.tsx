import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';
import { authOptions } from '@/lib/auth/config';
import { defaultLocale, Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Tableau de bord — Chalet Manager',
  description: 'Accédez à votre espace personnel pour gérer votre activité.',
};

interface DashboardLandingPageProps {
  params: { locale: Locale } | Promise<{ locale: Locale }>;
}

export default async function DashboardLandingPage({ params }: DashboardLandingPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const search = new URLSearchParams({ callbackUrl: `/${locale}/dashboard` });
    redirect(`/${locale}/signin?${search.toString()}`);
  }

  const role = session.user.role as 'OWNER' | 'TENANT' | 'SUPERADMIN' | undefined;
  if (role === 'TENANT') {
    redirect(`/${locale}/dashboard/tenant`);
  }
  if (role === 'OWNER') {
    redirect(`/${locale}/dashboard/owner`);
  }

  if (role === 'SUPERADMIN') {
    redirect(`/${locale}/superadmin`);
  }

  redirect(`/${locale}`);
}
