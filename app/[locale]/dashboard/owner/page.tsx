import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import DashboardOnboardingTrigger from '@/components/dashboard-onboarding-trigger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authOptions } from '@/lib/auth/config';
import { getOnboardingDraft } from '@/lib/db/onboarding';
import { getUserById } from '@/lib/db/users';
import { defaultLocale, Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Tableau de bord propriétaire — Chalet Manager',
  description: 'Suivez vos propriétés, vos réservations et vos performances locatives.',
};

interface OwnerDashboardPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const resolveSearchParams = async (
  searchParams: OwnerDashboardPageProps['searchParams'],
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

export default async function OwnerDashboardPage({ params, searchParams }: OwnerDashboardPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;
  const resolvedSearchParams = await resolveSearchParams(searchParams);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const search = new URLSearchParams({ callbackUrl: `/${locale}/dashboard/owner` });
    redirect(`/${locale}/signin?${search.toString()}`);
  }

  const role = session.user.role as 'OWNER' | 'TENANT' | 'SUPERADMIN' | undefined;
  if (role !== 'OWNER' && role !== 'SUPERADMIN') {
    redirect(`/${locale}/dashboard/tenant`);
  }

  const displayName = session.user.name ?? 'Propriétaire';
  const draft = session.user.id ? await getOnboardingDraft(session.user.id) : null;
  const dbUser = session.user.id ? await getUserById(session.user.id) : null;
  const [firstName, ...rest] = (dbUser?.name ?? '').trim().split(/\s+/);
  const lastName = rest.join(' ').trim();
  const prefill: Record<string, unknown> | null = {
    profile: {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      // phone is not stored on user, leave undefined
    },
  };
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
          Retrouvez ici l’ensemble de vos indicateurs clés, vos demandes entrantes et les actions à planifier pour vos
          propriétés.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <DashboardOnboardingTrigger
            role="OWNER"
            draft={draft?.data ?? null}
            label="Mettre à jour mon onboarding"
            defaultOpen={shouldOpenModal}
            prefill={prefill}
          />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Propriétés</CardTitle>
            <CardDescription>Suivez la performance et le statut de chacune de vos annonces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Consultez les taux d’occupation, mettez à jour les descriptifs ou déclenchez des opérations de maintenance.
            </p>
            <Button asChild>
              <Link href={`/${locale}/portfolio`}>Voir mes propriétés</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demandes & leads</CardTitle>
            <CardDescription>Suivez les nouvelles demandes de séjour et les réservations en cours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analysez le pipeline des leads, validez les arrivées à venir et assurez un suivi personnalisé.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/contact`}>Contacter l’équipe</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents & conformité</CardTitle>
            <CardDescription>Centralisez vos contrats, inventaires et attestations obligatoires.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gardez vos contrats, assurances et inventaires à jour pour garantir un suivi sécurisé et conforme.
            </p>
            <Button variant="secondary" asChild>
              <Link href={`/${locale}/services`}>Découvrir nos services</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
