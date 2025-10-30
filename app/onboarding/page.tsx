import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { authOptions } from '@/lib/auth/config';
import OnboardingClient from './onboarding-client';
import { getOnboardingDraft } from '@/lib/db/onboarding';
import { defaultLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Onboarding — Chalet Manager',
  description: "Complétez votre profil pour accéder à toutes les fonctionnalités.",
};

type OnboardingSearchParams = Record<string, string | string[] | undefined>;

interface OnboardingPageProps {
  searchParams?: Promise<OnboardingSearchParams>;
}

const resolveSearchParams = async (
  searchParams: OnboardingPageProps['searchParams'],
): Promise<OnboardingSearchParams> => {
  const resolved = await searchParams;
  return resolved ?? {};
};

const isModalOpen = (modalParam: string | string[] | undefined): boolean => {
  if (Array.isArray(modalParam)) {
    return modalParam.includes('1');
  }
  return modalParam === '1';
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/signin');
  }
  const role = session.user.role;
  if (role === 'SUPERADMIN') {
    redirect('/superadmin');
  }

  if (session.user.onboardingCompleted) {
    const destination = `/${defaultLocale}/dashboard/${role === 'OWNER' ? 'owner' : 'tenant'}`;
    redirect(destination);
  }

  const draft = await getOnboardingDraft(session.user.id);

  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const openModal = isModalOpen(resolvedSearchParams.modal);

  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <OnboardingClient role={role} openModal={openModal} draft={draft?.data ?? null} />
    </Suspense>
  );
}
