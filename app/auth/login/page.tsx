import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <LoginClient />
    </Suspense>
  );
}
