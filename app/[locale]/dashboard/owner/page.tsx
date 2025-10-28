import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { authOptions } from '@/lib/auth/config';
import { defaultLocale, Locale } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tableau de bord propriétaire — Chalet Manager',
  description: 'Suivez vos propriétés, vos réservations et vos performances locatives.',
};

interface OwnerDashboardPageProps {
  params: { locale: Locale } | Promise<{ locale: Locale }>;
}

export default async function OwnerDashboardPage({ params }: OwnerDashboardPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;

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

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Bienvenue</p>
        <h1 className="text-3xl font-semibold">Bonjour {displayName}</h1>
        <p className="text-muted-foreground">
          Retrouvez ici l’ensemble de vos indicateurs clés, vos demandes entrantes et les actions à planifier pour vos
          propriétés.
        </p>
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
