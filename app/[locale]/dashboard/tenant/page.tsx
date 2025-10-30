import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import DashboardOnboardingTrigger from '@/components/dashboard-onboarding-trigger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authOptions } from '@/lib/auth/config';
import { getOnboardingDraft } from '@/lib/db/onboarding';
import { defaultLocale, Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Tableau de bord locataire — Chalet Manager',
  description: 'Retrouvez vos séjours, vos documents et les services dédiés.',
};

interface TenantDashboardPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const resolveSearchParams = async (
  searchParams: TenantDashboardPageProps['searchParams'],
): Promise<Record<string, string | string[] | undefined>> => {
  const resolved = await searchParams;
  return resolved ?? {};
};

const isModalOpen = (modalParam: string | string[] | undefined): boolean => {
  if (Array.isArray(modalParam)) {
    return modalParam.includes('1');
  }
  return modalParam === '1';
};

const allowCompletedAccess = (modeParam: string | string[] | undefined): boolean => {
  if (Array.isArray(modeParam)) {
    return modeParam.includes('edit');
  }
  return modeParam === 'edit';
};

export default async function TenantDashboardPage({ params, searchParams }: TenantDashboardPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;
  const resolvedSearchParams = await resolveSearchParams(searchParams);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const search = new URLSearchParams({ callbackUrl: `/${locale}/dashboard/tenant` });
    redirect(`/${locale}/signin?${search.toString()}`);
  }

  const role = session.user.role as 'OWNER' | 'TENANT' | 'SUPERADMIN' | undefined;
  if (role !== 'TENANT' && role !== 'SUPERADMIN') {
    redirect(`/${locale}/dashboard/owner`);
  }

  const displayName = session.user.name ?? 'Invité';
  const draft = session.user.id ? await getOnboardingDraft(session.user.id) : null;
  const shouldForceOpen = !session.user.onboardingCompleted;
  const allowEdit = allowCompletedAccess(resolvedSearchParams.mode);
  const openFromQuery = isModalOpen(resolvedSearchParams.modal);
  const shouldOpenModal = shouldForceOpen || allowEdit || openFromQuery;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Bienvenue</p>
        <h1 className="text-3xl font-semibold">Bonjour {displayName}</h1>
        <p className="text-muted-foreground">
          Suivez vos séjours à venir, préparez votre arrivée et échangez facilement avec nos équipes dédiées.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <DashboardOnboardingTrigger
            role="TENANT"
            draft={draft?.data ?? null}
            label="Actualiser mon onboarding"
            defaultOpen={shouldOpenModal}
          />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vos séjours</CardTitle>
            <CardDescription>Consultez vos réservations confirmées et vos plannings de séjour.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Retrouvez les détails d’accès, vos horaires d’arrivée ou départ et vos demandes spécifiques.
            </p>
            <Button asChild>
              <Link href={`/${locale}/portfolio`}>Explorer les chalets</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conciergerie</CardTitle>
            <CardDescription>Demandez un service additionnel ou préparez une expérience sur-mesure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Chef privé, transferts, activités : faites-nous part de vos envies, nous organisons le reste.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/contact`}>Contacter la conciergerie</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Accédez à vos contrats, factures et informations pratiques.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Consultez ou téléchargez vos documents de réservation ainsi que les guides d’accueil du chalet.
            </p>
            <Button variant="secondary" asChild>
              <Link href={`/${locale}/faq`}>Voir la FAQ</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
