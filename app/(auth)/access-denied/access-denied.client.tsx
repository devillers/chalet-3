'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLocaleFromPathname } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const REASON_MESSAGES: Record<string, { title: string; description: string }> = {
  superadmin_only: {
    title: 'Portail SuperAdmin uniquement',
    description:
      'Vous avez tenté d’accéder à la console SuperAdmin. Seuls les administrateurs principaux disposant des droits requis peuvent y accéder.',
  },
  tenant_only: {
    title: 'Espace réservé aux locataires',
    description:
      'Cette section est disponible pour les locataires validés. Connectez-vous avec un compte locataire pour continuer.',
  },
  owner_only: {
    title: 'Espace réservé aux propriétaires',
    description:
      'Cette section est disponible pour les propriétaires validés. Connectez-vous avec un compte propriétaire pour continuer.',
  },
};

const defaultMessage = {
  title: 'Accès restreint',
  description:
    'Vous n’avez pas les autorisations nécessaires pour consulter cette page. Si vous pensez qu’il s’agit d’une erreur, contactez le support Chalet Manager.',
};

export default function AccessDeniedClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname ? getLocaleFromPathname(pathname) : undefined;
  const reason = searchParams?.get('reason');
  const message = (reason && REASON_MESSAGES[reason]) ?? defaultMessage;

  const signInHref = locale ? `/${locale}/signin` : '/signin';
  const supportHref = 'mailto:support@chalet-manager.com';

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-6 w-6" aria-hidden />
            <span className="text-sm font-semibold uppercase">Accès refusé</span>
          </div>
          <CardTitle className="text-2xl">{message.title}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {message.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href={signInHref} className={cn(buttonVariants({ size: 'lg' }), 'w-full justify-center sm:w-auto')}>
            Retourner à la connexion
          </Link>
          <a
            href={supportHref}
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'w-full justify-center sm:w-auto')}
          >
            Contacter le support
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
