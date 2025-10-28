import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { authOptions } from '@/lib/auth/config';
import { defaultLocale, Locale } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Tableau de bord locataire — Chalet Manager',
  description: 'Retrouvez vos séjours, vos documents et les services dédiés.',
};

interface TenantDashboardPageProps {
  params: { locale: Locale } | Promise<{ locale: Locale }>;
}

export default async function TenantDashboardPage({ params }: TenantDashboardPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;

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

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Bienvenue</p>
        <h1 className="text-3xl font-semibold">Bonjour {displayName}</h1>
        <p className="text-muted-foreground">
          Suivez vos séjours à venir, préparez votre arrivée et échangez facilement avec nos équipes dédiées.
        </p>
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
