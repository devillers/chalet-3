export { metadata } from '@/app/(auth)/signin/page';

import SignInForm from '@/app/(auth)/signin/sign-in-form';
import type { Locale } from '@/lib/i18n';

interface LocaleSignInPageProps {
  params: { locale: Locale };
}

export default function LocaleSignInPage({ params }: LocaleSignInPageProps) {
  return <SignInForm locale={params.locale} />;
}
