import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { inter } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Chalet Manager',
  description: 'Gestion de locations de prestige.',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  const lang = typeof locale === 'string' && locale.length > 0 ? locale : 'fr';

  return (
    <html lang={lang}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
