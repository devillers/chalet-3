export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr' as const;

export type Locale = (typeof locales)[number];

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }

  return defaultLocale;
}

export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as Locale)) {
    return '/' + segments.slice(2).join('/');
  }

  return pathname;
}

export async function getTranslations(locale: Locale) {
  try {
    const translations = await import(`@/public/locales/${locale}/common.json`);
    return translations.default;
  } catch (error) {
    const fallback = await import(`@/public/locales/${defaultLocale}/common.json`);
    return fallback.default;
  }
}

export function getAlternateLinks(locale: Locale, path: string) {
  return locales.map((l) => ({
    hreflang: l,
    href: `/${l}${path}`,
  }));
}
