import type { Metadata } from 'next';
import SignInForm from './sign-in-form';

export const metadata: Metadata = {
  title: 'Se connecter — Chalet Manager',
  description: 'Accédez à votre compte propriétaire ou locataire.',
};

export default function SignInPage() {
  return <SignInForm />;
}
