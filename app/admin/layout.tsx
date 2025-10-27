import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import SessionProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Administration - Chalet Manager',
  description: 'Tableau de bord d\'administration',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
