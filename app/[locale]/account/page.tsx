import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth/config';
import { defaultLocale, Locale } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Mon compte — Chalet Manager',
  description: 'Gérez vos informations personnelles, vos préférences et votre sécurité.',
};

interface AccountPageProps {
  params: { locale: Locale } | Promise<{ locale: Locale }>;
}

const ROLE_LABELS: Record<'OWNER' | 'TENANT' | 'SUPERADMIN', string> = {
  OWNER: 'Propriétaire',
  TENANT: 'Locataire',
  SUPERADMIN: 'SuperAdmin',
};

export default async function AccountPage({ params }: AccountPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = (resolvedParams?.locale ?? defaultLocale) as Locale;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const search = new URLSearchParams({ callbackUrl: `/${locale}/account` });
    redirect(`/${locale}/signin?${search.toString()}`);
  }

  const role = (session.user.role ?? 'TENANT') as 'OWNER' | 'TENANT' | 'SUPERADMIN';
  const displayName = session.user.name ?? session.user.email ?? 'Utilisateur';

  const dashboardPath = role === 'OWNER' ? '/dashboard/owner' : role === 'TENANT' ? '/dashboard/tenant' : '/superadmin';

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-10">
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Profil</p>
        <h1 className="text-3xl font-semibold">Mon compte</h1>
        <p className="text-muted-foreground">
          Retrouvez ici vos informations clés, votre statut et les actions rapides liées à votre rôle.
        </p>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
          </div>
          <Badge variant="outline">{ROLE_LABELS[role]}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-sm font-medium uppercase text-muted-foreground">Sécurité</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si vous souhaitez modifier votre mot de passe ou activer une sécurité renforcée, contactez nos équipes.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium uppercase text-muted-foreground">Notifications</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Les notifications transactionnelles (réservations, avenants, documents) sont envoyées à l’adresse email liée à ce compte.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}${dashboardPath}`} className={cn(buttonVariants(), 'text-sm')}>
              Accéder à mon tableau de bord
            </Link>
            <Link href={`/${locale}/contact`} className={cn(buttonVariants({ variant: 'outline' }), 'text-sm')}>
              Contacter l’assistance
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
