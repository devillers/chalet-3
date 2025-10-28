export { metadata } from '@/app/(auth)/signup/page';

import SignUpForm from '@/app/(auth)/signup/sign-up-form';
import type { Locale } from '@/lib/i18n';

interface LocaleSignUpPageProps {
  params: { locale: Locale };
}

export default function LocaleSignUpPage({ params }: LocaleSignUpPageProps) {
  return <SignUpForm locale={params.locale} />;
}
