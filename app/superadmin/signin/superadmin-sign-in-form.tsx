'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/lib/validators/sign-in';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = signInSchema.extend({
  role: signInSchema.shape.role.default('SUPERADMIN'),
}).pick({ email: true, password: true }).extend({ role: signInSchema.shape.role });

type SuperAdminSignInValues = {
  email: string;
  password: string;
  role: 'SUPERADMIN';
};

export default function SuperAdminSignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SuperAdminSignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', role: 'SUPERADMIN' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);
    const origin =
      typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    let targetUrl = '/superadmin';

    try {
      targetUrl = new URL(targetUrl, origin).toString();
    } catch {
      targetUrl = new URL('/superadmin', origin).toString();
    }

    const response = await signIn('credentials', {
      ...values,
      redirect: false,
      callbackUrl: targetUrl,
    });
    setIsSubmitting(false);

    if (response?.error) {
      if (response.error === 'ACCESS_RESTRICTED') {
        setError('Accès réservé aux SuperAdmins.');
        return;
      }
      setError('Connexion impossible. Veuillez vérifier vos identifiants.');
      return;
    }

    if (response?.ok) {
      const destination = response.url ?? targetUrl;
      try {
        const parsed = new URL(destination, origin);
        const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        router.push(relative);
      } catch {
        router.push('/superadmin');
      }
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16">
      <Card className="w-full max-w-md border-primary/40 bg-slate-900 text-slate-50">
        <CardHeader>
          <CardTitle className="text-2xl">Console SuperAdmin</CardTitle>
          <CardDescription className="text-slate-200">
            Accès strictement réservé. Les tentatives sont journalisées.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} className="bg-slate-800 text-slate-50" />
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
                      <Input type="password" autoComplete="current-password" {...field} className="bg-slate-800 text-slate-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <input type="hidden" value="SUPERADMIN" {...form.register('role')} />
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
