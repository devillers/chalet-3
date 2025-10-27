import type { Metadata } from 'next';
import SuperAdminSignIn from './superadmin-sign-in-form';

export const metadata: Metadata = {
  title: 'Connexion SuperAdmin — Chalet Manager',
  description: 'Accédez à la console SuperAdmin sécurisée.',
};

export default function SuperAdminSignInPage() {
  return <SuperAdminSignIn />;
}
