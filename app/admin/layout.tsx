import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/providers/SessionProvider';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Administration - Chalet Manager',
  description: 'Tableau de bord d\'administration',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
