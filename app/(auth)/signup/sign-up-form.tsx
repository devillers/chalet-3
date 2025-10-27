'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@/lib/validators/sign-up';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export default function SignUpForm() {
  const router = useRouter();
  const [role, setRole] = useState<SignUpInput['role']>('OWNER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(json?.message ?? 'Inscription impossible.');
      return;
    }

    router.push(`/signin?role=${values.role}`);
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
              <Link href="/signin" className="text-primary underline">
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>
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
