export { metadata } from '@/app/(auth)/signup/page';

import SignUpForm from '@/app/(auth)/signup/sign-up-form';
import type { Locale } from '@/lib/i18n';

interface LocaleSignUpPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function LocaleSignUpPage({ params }: LocaleSignUpPageProps) {
  const resolvedParams = await params;

  return <SignUpForm locale={resolvedParams.locale} />;
}
