import { Metadata } from 'next';
import Script from 'next/script';
import { Mail, MapPin, Phone, ArrowRight, PhoneCall } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo/metadata';
import ContactForm from '@/components/forms/ContactForm';
import PageHeader from '@/components/sections/PageHeader';

// ----------
// Types
// ----------
interface PageProps {
  params: { locale: Locale };
}

// ----------
// SEO
// ----------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const translations = await getTranslations(locale);

  return generatePageMetadata({
    title: `${translations.contact.title} - Chalet Manager`,
    description: translations.contact.subtitle,
    path: '/contact',
    locale,
  });
}

// ----------
// Page
// ----------
export default async function ContactPage({ params }: PageProps) {
  const { locale } = params;
  const t = await getTranslations(locale);

  // Fallbacks derived from provided translation keys to avoid adding new keys
  const emailLabel = 'Email';
  const phoneLabel = t.contact?.form?.phone ?? 'Téléphone';
  const addressLine = t.contact?.info?.address ?? '';
  const addressTitle = (addressLine.split(',')[0] || 'Adresse').trim();

  const emailHref = 'mailto:contact@chaletmanager.fr';
  const phoneHref = `tel:${(t.contact?.info?.phone || '').replace(/\s+/g, '')}`;

  return (
    <div className="bg-white">
      {/* HERO */}
      <PageHeader
        title={t.contact.title}
        description={t.contact.subtitle}
        imageUrl="/images/TOPO-CHALET-3.png"
      />

      {/* MAIN */}
      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Quick CTA bar */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-4xl font-thin uppercase  text-gray-600">{t.contact.subtitle}</div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Left column: contact info (sticky on desktop) */}
            <aside className="lg:col-span-1 lg:sticky lg:top-6 self-start">
              <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.contact.info.title}</h2>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                      <Mail className="h-5 w-5 text-[#bd9254]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{emailLabel}</p>
                      <a
                        href={emailHref}
                        className="text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9254] rounded"
                      >
                        {t.contact.info.email}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                      <Phone className="h-5 w-5 text-[#bd9254]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{phoneLabel}</p>
                      <a
                        href={phoneHref}
                        className="text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9254] rounded"
                      >
                        {t.contact.info.phone} 
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                      <MapPin className="h-5 w-5 text-[#bd9254]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{addressTitle}</p>
                      <p className="text-gray-600">{addressLine}</p>
                    </div>
                  </li>
                </ul>

                {/* Trust / response time */}
                <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">Service</p>
                  <p>Réponse sous 24h ouvrées. Intervention 7j/7 en haute saison.</p>
                </div>

                {/* Opening hours */}
                <div className="mt-4 rounded-xl bg-white p-4 text-sm text-gray-700 border border-gray-200">
                  <p className="font-medium text-gray-900 mb-2">Horaires d'ouverture</p>
                  <ul className="space-y-1">
                    {[
                      { d: 'Lundi', h: '09:00 – 18:00' },
                      { d: 'Mardi', h: '09:00 – 18:00' },
                      { d: 'Mercredi', h: '09:00 – 18:00' },
                      { d: 'Jeudi', h: '09:00 – 18:00' },
                      { d: 'Vendredi', h: '09:00 – 17:00' },
                      { d: 'Samedi', h: '10:00 – 16:00' },
                      { d: 'Dimanche', h: 'Fermé' },
                    ].map((row) => (
                      <li key={row.d} className="flex items-center justify-between">
                        <span>{row.d}</span>
                        <span className="tabular-nums text-gray-600">{row.h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Right column: form */}
            <section className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{t.contact.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{t.contact.subtitle}</p>
                  </div>
                </div>

                {/* Contact extras: Calendar + FAQ side-by-side */}
                <div className="mt-8">
                  {/* FAQ – Accordions */}
                  <div className="rounded-2xl border border-gray-200 bg-white h-full">
                    <div className="px-6 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900">Questions fréquentes</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Voici les réponses aux questions que l’on nous pose le plus souvent.
                      </p>
                    </div>
                    <div className="mt-2 divide-y divide-gray-200">
                      {[
                        {
                          q: "Comment se déroule la prise en charge d'un nouveau chalet ?",
                          a: 'Audit initial (état, conformité, DPE, inventaire), cadrage des prestations (para‑hôtelier ou classique), mise en place des process (check‑in/out, ménage, linge), puis lancement commercial (annonces, tarifs, calendrier).',
                        },
                        {
                          q: 'Proposez‑vous un mandat semi‑exclusif ?',
                          a: "Oui. Vous gardez une part d'exploitation directe si vous le souhaitez, nous gérons le reste (opérations, distribution sélective, revenue management).",
                        },
                        {
                          q: 'Sous quel délai répondez‑vous ?',
                          a: 'Nous répondons sous 24h ouvrées aux demandes standard, et assurons une astreinte 7j/7 en haute saison pour les urgences voyageurs.',
                        },
                        {
                          q: 'Comment sont gérés les dépôts de garantie et la taxe de séjour ?',
                          a: 'Les dépôts sont pré‑autorisés via Stripe. La taxe de séjour est collectée et déclarée conformément aux exigences locales (EPCI/commune).',
                        },
                      ].map((item, idx) => (
                        <details key={idx} className="group px-6 py-4 open:bg-gray-50">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                            <h4 className="text-sm font-medium text-gray-900">{item.q}</h4>
                            <span className="text-gray-400 transition group-open:rotate-90">›</span>
                          </summary>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.a}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 mt-8">
                <div className="my-8">
                  <ContactForm locale={locale} translations={t} />
                </div>

                {/* Helper notes */}
                <p className="mt-4 text-xs leading-relaxed text-gray-500">
                  En soumettant ce formulaire, vous acceptez d'être recontacté. Vos données sont
                  traitées conformément à notre politique de confidentialité.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* JSON-LD: Organization + ContactPage */}
      <Script id="jsonld-contact" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: `${t.contact.title} - Chalet Manager`,
          description: t.contact.subtitle,
          mainEntity: {
            '@type': 'Organization',
            name: 'Chalet Manager',
            url: 'https://chaletmanager.fr',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: 'contact@chaletmanager.fr',
              telephone: t.contact?.info?.phone || '',
              availableLanguage: ['fr', 'en'],
            },
          },
        })}
      </Script>

      {/* Calendly embed script (once per page) */}
    </div>
  );
}
