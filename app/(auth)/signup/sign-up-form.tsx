// app/(auth)/signup/sign-up-form.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

const schema = z
  .object({
    name: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, '8 caractères minimum'),
    confirmPassword: z.string().min(8),
    role: z.enum(['OWNER', 'TENANT']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

type SignUpValues = z.infer<typeof schema>;

function resolveLocale(pathname: string | null): Locale {
  if (!pathname) return defaultLocale;
  const seg = pathname.split('/')[1];
  return locales.includes(seg as Locale) ? (seg as Locale) : defaultLocale;
}

export default function SignUpForm() {
  const pathname = usePathname();
  const locale = useMemo(() => resolveLocale(pathname), [pathname]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrf, setCsrf] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/csrf', { cache: 'no-store' });
        const j = await r.json();
        setCsrf(j?.csrfToken ?? null);
      } catch {
        setCsrf(null);
      }
    })();
  }, []);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'OWNER',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // 1) Signup
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf ?? '',
        },
        body: JSON.stringify(values),
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => null);
        setError(j?.message ?? 'Inscription impossible.');
        setIsSubmitting(false);
        return;
      }

      // 2) Login (redirect: false) + FORCE redirect manuelle
      const dashboard = `/${locale}/dashboard/${values.role === 'OWNER' ? 'owner' : 'tenant'}`;
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        role: values.role,
        redirect: false,          // ← on récupère la réponse sans changer la page
        callbackUrl: dashboard,   // ← utile si next-auth décide quand même de rediriger
      });

      // Si next-auth n’a pas posé la session, res?.ok sera false → on reste explicite
      if (res?.ok) {
        // 3) Forcer la redirection (bypass complet du flux client NextAuth)
        window.location.href = res.url ?? dashboard;
      } else {
        // fallback dur : on tente quand même d’aller au dashboard (le middleware contrôlera)
        window.location.href = dashboard;
      }
    } catch {
      setError('Inscription impossible.');
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Choisissez votre rôle et créez vos identifiants.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Je suis</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={(v) => v && field.onChange(v)}
                        className="grid grid-cols-2 gap-2"
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

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={!csrf || isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
