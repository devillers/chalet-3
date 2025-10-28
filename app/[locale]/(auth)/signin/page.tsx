export { metadata } from '@/app/(auth)/signin/page';

import SignInForm from '@/app/(auth)/signin/sign-in-form';
import type { Locale } from '@/lib/i18n';

interface LocaleSignInPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function LocaleSignInPage({ params }: LocaleSignInPageProps) {
  const resolvedParams = await params;

  return <SignInForm locale={resolvedParams.locale} />;
}
