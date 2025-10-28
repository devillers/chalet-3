export { metadata } from '@/app/(auth)/signin/page';

import SignInForm from '@/app/(auth)/signin/sign-in-form';
import type { Locale } from '@/lib/i18n';

interface LocaleSignInPageProps {
  params: { locale: Locale } | Promise<{ locale: Locale }>;
}

export default async function LocaleSignInPage({ params }: LocaleSignInPageProps) {
  const resolvedParams = await Promise.resolve(params);

  return <SignInForm locale={resolvedParams.locale} />;
}
