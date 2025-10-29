import type { Metadata } from 'next';
import AccessDeniedClient from './access-denied.client';

export const metadata: Metadata = {
  title: 'Accès restreint — Chalet Manager',
  description: 'Cette section est protégée et nécessite des autorisations supplémentaires.',
  robots: 'noindex, nofollow',
};

export default function AccessDeniedPage() {
  return <AccessDeniedClient />;
}
