// app/onboarding/page.tsx
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
  if (Array.isArray(modalParam)) return modalParam.includes('1');
  return modalParam === '1';
};

const allowCompletedAccess = (modeParam: string | string[] | undefined): boolean => {
  if (Array.isArray(modeParam)) return modeParam.includes('edit');
  return modeParam === 'edit';
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/signin');
  }

  // ⬇️ Élargit localement le type pour inclure SUPERADMIN (au cas où)
  type AnyRole = 'OWNER' | 'TENANT' | 'SUPERADMIN';
  const role = (session.user.role as AnyRole) ?? 'TENANT';

  // ⬇️ Accès admin : redirige immédiatement
  if (role === 'SUPERADMIN') {
    redirect('/superadmin');
  }

  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const canBypassCompletionCheck = allowCompletedAccess(resolvedSearchParams.mode);

  if (session.user.onboardingCompleted && !canBypassCompletionCheck) {
    const destination = `/${defaultLocale}/dashboard/${role === 'OWNER' ? 'owner' : 'tenant'}`;
    redirect(destination);
  }

  // ⬇️ Récupération du brouillon (signature actuelle: userId uniquement)
  const draft = await getOnboardingDraft(session.user.id);

  const openModal = canBypassCompletionCheck || isModalOpen(resolvedSearchParams.modal);

  // ⬇️ Le composant client n’accepte que 'OWNER' | 'TENANT'
  const clientRole: 'OWNER' | 'TENANT' = role === 'OWNER' ? 'OWNER' : 'TENANT';

  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <OnboardingClient role={clientRole} openModal={openModal} draft={draft?.data ?? null} />
    </Suspense>
  );
}
