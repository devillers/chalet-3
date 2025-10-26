import Link from 'next/link';
import { Mountain, Mail, MapPin } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface FooterProps {
  locale: Locale;
  translations: any;
}

export default function Footer({ locale, translations }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Mountain className="h-8 w-8 text-blue-400" aria-hidden="true" />
              <span className="text-xl font-bold text-white">Chalet Manager</span>
            </div>
            <p className="text-sm">
              {translations.footer.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {translations.nav.contact}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <a
                  href="mailto:contact@chaletmanager.fr"
                  className="text-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-colors"
                >
                  contact@chaletmanager.fr
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>Les Alpes, France</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {locale === 'fr' ? 'Légal' : 'Legal'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/legal-notice`}
                  className="text-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-colors"
                >
                  {translations.footer.links.legal}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="text-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-colors"
                >
                  {translations.footer.links.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-colors"
                >
                  {locale === 'fr' ? 'Connexion Admin' : 'Admin Login'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>{translations.footer.copyright.replace('{{year}}', currentYear.toString())}</p>
        </div>
      </div>
    </footer>
  );
}
