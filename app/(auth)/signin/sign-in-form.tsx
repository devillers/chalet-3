'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInSchema } from '@/lib/validators/sign-in';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n';

const formSchema = signInSchema.pick({ email: true, password: true }).extend({
  role: z.enum(['OWNER', 'TENANT']),
});

export type SignInFormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  locale?: Locale;
}

const withLocale = (locale: Locale | undefined, path: string) =>
  locale ? `/${locale}${path}` : path;

export default function SignInForm({ locale }: SignInFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params?.get('callbackUrl');
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'OWNER',
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    setIsSubmitting(true);
    const defaultDestination = withLocale(
      locale,
      '/',
    );
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    let targetUrl = callbackUrl ?? defaultDestination;

    try {
      // Normalise the callback URL so NextAuth always receives an absolute URL.
      targetUrl = new URL(targetUrl, origin).toString();
    } catch {
      targetUrl = new URL(defaultDestination, origin).toString();
    }

    const response = await signIn('credentials', {
      ...data,
      redirect: false,
      callbackUrl: targetUrl,
      role: data.role,
    });
    setIsSubmitting(false);

    if (response?.error) {
      if (response.error === 'ACCESS_RESTRICTED') {
        setError('Accès réservé au bon portail.');
        return;
      }
      setError('Impossible de vous connecter. Vérifiez vos informations.');
      return;
    }

    if (response?.ok) {
      const destination = response.url ?? targetUrl;
      try {
        const parsed = new URL(destination, origin);
        const relativePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        router.push(relativePath);
      } catch {
        router.push(defaultDestination);
      }
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Sélectionnez votre rôle pour accéder à votre espace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vous êtes</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={(value) => value && field.onChange(value)}
                        className="grid grid-cols-2 gap-2"
                        aria-label="Choisir un rôle"
                      >
                        <ToggleGroupItem value="OWNER" className="py-3 text-sm">
                          Propriétaire
                        </ToggleGroupItem>
                        <ToggleGroupItem value="TENANT" className="py-3 text-sm">
                          Locataire
                        </ToggleGroupItem>
                      </ToggleGroup>
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
                    <FormLabel>Adresse email</FormLabel>
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
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </Form>
          <p className="text-sm text-muted-foreground">
            Administrateur ?{' '}
            <Link href="/superadmin/signin" className="text-primary underline">
              Accéder au portail SuperAdmin
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href={withLocale(locale, '/signup')} className="text-primary underline">
              Créer un compte
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
