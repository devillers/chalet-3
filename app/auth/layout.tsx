import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Connexion - Chalet Manager',
  description: 'Espace d\'administration Chalet Manager',
  robots: 'noindex, nofollow',
};

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
