import Link from 'next/link';
import {
  Mountain,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { pacifico } from '@/lib/fonts';
import type { Locale } from '@/lib/i18n';

interface FooterProps {
  locale: Locale;
  translations: Record<string, unknown>;
}

export default function Footer({ locale, translations }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footer = ((translations as any).footer ?? {}) as Record<string, unknown>;
  const navigation = (footer.sections ?? {}) as Record<string, unknown>;
  const contact = (footer.contact ?? {}) as Record<string, unknown>;
  const newsletter = (footer.newsletter ?? {}) as Record<string, unknown>;
  const brand = (footer.brand ?? {}) as Record<string, unknown>;
  const bottomBar = (footer.bottomBar ?? {}) as Record<string, unknown>;
  const servicesSection = (navigation as any).services ?? {};
  const companySection = (navigation as any).company ?? {};
  const legalSection = (navigation as any).legal ?? {};
  const bottomLinks = ((bottomBar.links ?? legalSection.links ?? []) as any[]).filter(Boolean);
  const adminLoginLabel = locale === 'fr' ? 'Connexion Admin' : 'Admin Login';
  const adminLoginLink = { name: adminLoginLabel, href: '/auth/login' };
  const displayBottomLinks = Array.isArray(bottomLinks)
    ? bottomLinks.some((link) => link?.href === adminLoginLink.href)
      ? bottomLinks
      : [...bottomLinks, adminLoginLink]
    : [adminLoginLink];
  const resolvedBottomLinks = displayBottomLinks.filter(
    (item) => item && typeof item.name === 'string' && typeof item.href === 'string',
  );
  const brandName: string = (translations as any).nav?.brandName || 'Chalet Manager';
  const brandDescription = typeof (brand as any).description === 'string' ? (brand as any).description : undefined;
  const contactEmail = typeof (contact as any).email === 'string' ? (contact as any).email : undefined;
  const contactPhone = typeof (contact as any).phone === 'string' ? (contact as any).phone : undefined;
  const locationLines = Array.isArray((contact as any).locationLines)
    ? ((contact as any).locationLines as string[])
    : [];
  const newsletterTitle = typeof (newsletter as any).title === 'string' ? (newsletter as any).title : undefined;
  const newsletterDescription =
    typeof (newsletter as any).description === 'string' ? (newsletter as any).description : undefined;
  const newsletterPlaceholder =
    typeof (newsletter as any).placeholder === 'string' ? (newsletter as any).placeholder : '';
  const newsletterButton = typeof (newsletter as any).button === 'string' ? (newsletter as any).button : '';
  const followUsLabel = typeof (newsletter as any).followUs === 'string' ? (newsletter as any).followUs : undefined;
  const copyrightText = typeof (bottomBar as any).copyright === 'string'
    ? (bottomBar as any).copyright
    : '';

  const localizeHref = (href: string) => {
    if (!href || typeof href !== 'string') {
      return '#';
    }

    if (!href.startsWith('/')) {
      return href;
    }

    if (href === '/') {
      return `/${locale}`;
    }

    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) {
      return href;
    }

    return `/${locale}${href}`;
  };

  return (
    <footer className="bg-neutral-900 text-neutral-600 text-[12px] font-light" role="contentinfo">
      {/* Contenu principal du footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Colonne 1 : Infos entreprise & contact */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Mountain className="h-8 w-8 text-amber-700" aria-hidden="true" />
              <span className={`${pacifico.className} text-xl text-neutral-100`}>{brandName}</span>
            </div>

            {brandDescription && (
              <p className="text-neutral-600 mb-6 leading-relaxed">{brandDescription}</p>
            )}

            <div className="space-y-3">
              {contactEmail && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-amber-700 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-neutral-600 hover:text-white transition-colors   rounded"
                  >
                    {contactEmail}
                  </a>
                </div>
              )}

              {contactPhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-amber-700 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                    className="text-neutral-600 hover:text-white transition-colors   rounded"
                  >
                    {contactPhone}
                  </a>
                </div>
              )}

              {locationLines.length > 0 && (
                <div className="flex items-start space-x-3">
                  <MapPin
                    className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-neutral-600">
                    {locationLines.map((line: string, index: number) => (
                      <span key={index}>
                        {line}
                        {index !== locationLines.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Colonne 2 : Services */}
          <div>
            <h3 className="text-lg uppercase text-neutral-100 font-thin mb-6">
              {(servicesSection as any).title}
            </h3>
            <ul className="space-y-3">
              {Array.isArray((servicesSection as any).links) &&
                (servicesSection as any).links.map((item: any) => (
                  <li key={item.name}>
                    <Link
                    href={localizeHref(item.href)}
                    className="text-neutral-600 hover:text-white transition-colors duration-200 block   rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Entreprise */}
          <div>
            <h3 className="text-lg uppercase text-neutral-100 font-thin mb-6">
              {(companySection as any).title}
            </h3>
            <ul className="space-y-3">
              {Array.isArray((companySection as any).links) &&
                (companySection as any).links.map((item: any) => (
                  <li key={item.name}>
                    <Link
                    href={localizeHref(item.href)}
                    className="text-neutral-600 hover:text-white transition-colors duration-200 block   rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 : Newsletter & Réseaux sociaux */}
          <div>
            <h3 className="text-lg uppercase text-neutral-100 font-thin mb-6">{newsletterTitle}</h3>

            {newsletterDescription && (
              <div className="mb-6">
                <p className="text-neutral-600 text-xs mb-3">{newsletterDescription}</p>
                <form className="space-y-2">
                  <input
                    type="email"
                    placeholder={newsletterPlaceholder}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg   text-white placeholder-neutral-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-amber-700 text-white rounded-lg font-medium 
                               hover:bg-primary-800 transition-colors duration-200"
                  >
                    {newsletterButton}
                  </button>
                </form>
              </div>
            )}

            {followUsLabel && (
              <div>
                <p className="text-xs text-neutral-600 mb-3">{followUsLabel}</p>
                <div className="flex space-x-3">
                  {[
                    { name: 'Facebook', href: '#', icon: Facebook },
                    { name: 'Twitter', href: '#', icon: Twitter },
                    { name: 'Instagram', href: '#', icon: Instagram },
                    { name: 'LinkedIn', href: '#', icon: Linkedin },
                  ].map(({ name, href, icon: IconComponent }) => (
                    <a
                      key={name}
                      href={href}
                      className="p-2 bg-neutral-800 rounded-lg hover:bg-amber-700 transition-colors duration-200 group"
                      aria-label={name}
                    >
                      <IconComponent
                        className="h-5 w-5 text-neutral-600 group-hover:text-white"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-[11px] text-neutral-600 uppercase">
              © {currentYear} {brandName}. {copyrightText}
            </div>
            <div className="flex items-center space-x-6">
              {resolvedBottomLinks.map((item: any) => (
                <Link
                  key={item.name}
                  href={localizeHref(item.href)}
                  className={[
                    'text-[11px] uppercase hover:text-white transition-colors duration-200   rounded',
                    item.href === adminLoginLink.href ? 'text-amber-700' : 'text-neutral-600',
                  ].join(' ')}
                >
                  {item.name}
                </Link>
              ))}

              {bottomLinks.length === 0 && (
                <Link
                  href={localizeHref(adminLoginLink.href)}
                  className="text-[11px] text-amber-700 uppercase hover:text-white transition-colors duration-200   rounded"
                >
                  {locale === 'fr' ? 'Connexion Admin' : 'Admin Login'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
