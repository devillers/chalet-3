import Link from 'next/link';
import { Mountain, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { pacifico } from '@/lib/fonts';

interface FooterProps {
  locale: string; // e.g. 'fr' or 'en'
  translations: any; // You can later refine this type
}

export default function Footer({ locale, translations }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footer = translations.footer ?? {};
  const navigation = footer.sections ?? {};
  const contact = footer.contact ?? {};
  const newsletter = footer.newsletter ?? {};
  const brand = footer.brand ?? {};
  const bottomBar = footer.bottomBar ?? {}; // ✅ ajouté
  const bottomLinks = (bottomBar.links ?? navigation.legal?.links ?? []) as any[];
  const adminLoginLabel = locale === 'fr' ? 'Connexion Admin' : 'Admin Login';
  const adminLoginLink = { name: adminLoginLabel, href: '/auth/login' };
  const displayBottomLinks = Array.isArray(bottomLinks)
    ? bottomLinks.some((link) => link?.href === adminLoginLink.href)
      ? bottomLinks
      : [...bottomLinks, adminLoginLink]
    : [adminLoginLink];
  const brandName: string = translations.nav?.brandName || 'Chalet Manager';

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

            {brand.description && (
              <p className="text-neutral-600 mb-6 leading-relaxed">
                {brand.description}
              </p>
            )}

            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-amber-700 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-neutral-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  >
                    {contact.email}
                  </a>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-amber-700 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="text-neutral-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}

              {Array.isArray(contact.locationLines) && contact.locationLines.length > 0 && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-neutral-600">
                    {contact.locationLines.map((line: string, index: number) => (
                      <span key={index}>
                        {line}
                        {index !== contact.locationLines.length - 1 && <br />}
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
              {navigation.services?.title}
            </h3>
            <ul className="space-y-3">
              {navigation.services?.links?.map((item: any) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 hover:text-white transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
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
              {navigation.company?.title}
            </h3>
            <ul className="space-y-3">
              {navigation.company?.links?.map((item: any) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 hover:text-white transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 : Newsletter & Réseaux sociaux */}
          <div>
            <h3 className="text-lg uppercase text-neutral-100 font-thin mb-6">
              {newsletter.title}
            </h3>

            {newsletter.description && (
              <div className="mb-6">
                <p className="text-neutral-600 text-xs mb-3">{newsletter.description}</p>
                <form className="space-y-2">
                  <input
                    type="email"
                    placeholder={newsletter.placeholder}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                               text-white placeholder-neutral-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-amber-700 text-white rounded-lg font-medium 
                               hover:bg-primary-800 transition-colors duration-200"
                  >
                    {newsletter.button}
                  </button>
                </form>
              </div>
            )}

            {newsletter.followUs && (
              <div>
                <p className="text-xs text-neutral-600 mb-3">{newsletter.followUs}</p>
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
                      <IconComponent className="h-5 w-5 text-neutral-600 group-hover:text-white" aria-hidden="true" />
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
              © {currentYear} {brandName}. {bottomBar?.copyright}
            </div>
            <div className="flex items-center space-x-6">
              {displayBottomLinks.map((item: any) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={[
                    'text-[11px] uppercase hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded',
                    item.href === adminLoginLink.href ? 'text-amber-700' : 'text-neutral-600',
                  ].join(' ')}
                >
                  {item.name}
                </Link>
              ))}


              {bottomLinks.length === 0 && (
                <Link
                  href="/auth/login"
                  className="text-[11px] text-amber-700 uppercase hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
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
