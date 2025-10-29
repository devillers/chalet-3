import { Suspense } from 'react';
import type { Metadata } from 'next';
import SignInForm from './sign-in-form';

export const metadata: Metadata = {
  title: 'Se connecter — Chalet Manager',
  description: 'Accédez à votre compte propriétaire ou locataire.',
};

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFormFallback />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInFormFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
        <div className="mt-6 space-y-4">
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
