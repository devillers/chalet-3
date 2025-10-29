// app/(auth)/signin/sign-in-form.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['OWNER', 'TENANT']),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextAuthError = params?.get('error');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', role: 'OWNER' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null);
    setIsSubmitting(true);

    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const callbackUrlParam = params?.get('callbackUrl');
    const defaultTarget = '/dashboard/' + (data.role === 'OWNER' ? 'owner' : 'tenant');
    const targetUrl = new URL(callbackUrlParam || defaultTarget, origin).toString();

    const res = await signIn('credentials', {
      ...data, // email, password, role
      redirect: false,
      callbackUrl: targetUrl,
    });

    setIsSubmitting(false);

    if (res?.error) {
      setError(
        res.error === 'CredentialsSignin'
          ? 'Identifiants invalides ou rôle incorrect.'
          : 'Connexion impossible.'
      );
      return;
    }

    const dest = res?.url ?? targetUrl;
    try {
      const parsed = new URL(dest, origin);
      router.push(`${parsed.pathname}${parsed.search}${parsed.hash}`);
    } catch {
      router.push(defaultTarget);
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
                        onValueChange={(v) => v && field.onChange(v)}
                        className="grid grid-cols-2 gap-2"
                      >
                        <ToggleGroupItem value="OWNER" className="py-3 text-sm">Propriétaire</ToggleGroupItem>
                        <ToggleGroupItem value="TENANT" className="py-3 text-sm">Locataire</ToggleGroupItem>
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
                      <Input type="email" autoComplete="email" placeholder="vous@example.com" {...field}/>
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
                      <Input type="password" autoComplete="current-password" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(error || nextAuthError) && (
                <p className="text-sm text-destructive">
                  {error ?? (nextAuthError === 'CredentialsSignin' ? 'Identifiants invalides ou rôle incorrect.' : 'Connexion impossible.')}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
