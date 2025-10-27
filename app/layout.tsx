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
  params: Promise<{ locale?: string }> | { locale?: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const lang =
    typeof resolvedParams.locale === 'string' && resolvedParams.locale.length > 0 ? resolvedParams.locale : 'fr';

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
