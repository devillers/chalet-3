export { metadata } from '@/app/superadmin/signin/page';

import SuperAdminSignIn from '@/app/superadmin/signin/superadmin-sign-in-form';
import type { Locale } from '@/lib/i18n';

interface LocaleSuperAdminSignInPageProps {
  params: { locale: Locale } | Promise<{ locale: Locale }>;
}

export default async function LocaleSuperAdminSignInPage({ params }: LocaleSuperAdminSignInPageProps) {
  await Promise.resolve(params);

  return <SuperAdminSignIn />;
}
