import type { Metadata } from 'next';
import SignUpForm from './sign-up-form';

export const metadata: Metadata = {
  title: 'Créer un compte — Chalet Manager',
  description: 'Inscrivez-vous en tant que propriétaire ou locataire.',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
