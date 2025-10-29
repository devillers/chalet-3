'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@/lib/validators/sign-up';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n';

const ROLE_CARDS: Array<{ id: SignUpInput['role']; title: string; description: string }> = [
  {
    id: 'OWNER',
    title: 'Propriétaire',
    description: 'Publiez vos logements, gérez vos réservations et vos documents.',
  },
  {
    id: 'TENANT',
    title: 'Locataire',
    description: 'Enregistrez vos préférences, documents et candidatures.',
  },
];

interface SignUpFormProps {
  locale?: Locale;
}

const withLocale = (locale: Locale | undefined, path: string) =>
  locale ? `/${locale}${path}` : path;

export default function SignUpForm({ locale }: SignUpFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<SignUpInput['role']>('OWNER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoadingCsrf, setIsLoadingCsrf] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadToken = async () => {
      try {
        const response = await fetch('/api/auth/csrf', { method: 'GET' });
        if (!response.ok) {
          throw new Error('CSRF request failed');
        }
        const data = (await response.json()) as { token?: string };
        if (isMounted) {
          setCsrfToken(data.token ?? null);
        }
      } catch {
        if (isMounted) {
          setError('Erreur de sécurité. Veuillez rafraîchir la page et réessayer.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingCsrf(false);
        }
      }
    };

    void loadToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);
    if (!csrfToken) {
      setError('Le formulaire n’est pas encore prêt. Veuillez patienter.');
      return;
    }

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify(values),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(json?.message ?? 'Inscription impossible.');
      return;
    }

    router.push(`${withLocale(locale, '/signin')}?role=${values.role}`);
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-2">
          <CardTitle>Création de compte</CardTitle>
          <CardDescription>Sélectionnez votre profil pour commencer l&apos;onboarding personnalisé.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">Je suis</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {ROLE_CARDS.map((card) => {
                const isActive = role === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setRole(card.id);
                      form.setValue('role', card.id, { shouldValidate: true });
                    }}
                    className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'
                    }`}
                    aria-pressed={isActive}
                  >
                    <p className="text-base font-semibold">{card.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Déjà inscrit ?{' '}
              <Link href={withLocale(locale, '/signin')} className="text-primary underline">
                Se connecter
              </Link>
            </p>
          </div>
          <div>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom Nom" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" placeholder="vous@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <input type="hidden" value={role} {...form.register('role')} />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isLoadingCsrf || !csrfToken}
                >
                  {isSubmitting ? 'Création...' : 'Créer mon compte'}
                </Button>
              </form>
            </Form>
            <p className="mt-6 text-xs text-muted-foreground">
              La création de compte n&apos;ouvre jamais un accès SuperAdmin. Pour une invitation SuperAdmin, contactez le support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
