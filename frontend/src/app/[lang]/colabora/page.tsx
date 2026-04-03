import type { Metadata } from 'next';
import Link from 'next/link';
import { Lang, Settings, StripeProduct, PageSections, SITE_URL, getSectionValue } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import SectionTitle from '@/components/ui/SectionTitle';
import TaxDeduction from '@/components/colabora/TaxDeduction';
import DonationWidget from '@/components/colabora/DonationWidget';
import FaqAccordion from '@/components/faq/FaqAccordion';
import PageViewTracker from '@/components/ui/PageViewTracker';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr
    ? 'Faire un don à la Fondation Lumière du Bénin — Différentes façons d\'aider'
    : 'Dona a Fundación Luz de Benín — Distintas formas de ayudar';
  const description = isFr
    ? "Faites un don à la Fondation Lumière du Bénin. Déductible fiscalement à 80 %. Chaque euro compte pour les orphelinats, les mères célibataires et les projets de développement au Bénin."
    : 'Donación puntual o mensual, apadrinamiento de animales o apoyo a proyectos. Deducible al 80% en el IRPF. Sin intermediarios, impacto directo en Benín.';
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/colabora/`,
      languages: {
        'es': `${SITE_URL}/es/colabora/`,
        'fr': `${SITE_URL}/fr/colabora/`,
        'x-default': `${SITE_URL}/es/colabora/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/colabora/`,
      images: [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 600, alt: title }],
    },
  };
}

export default async function ColaboraPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;

  const [sec, settings, stripeProducts, faqs] = await Promise.all([
    api.getPageSections('colabora').catch(() => ({})),
    api.getSettings().catch(() => ({} as Settings)),
    api.getStripeProducts().catch(() => [] as StripeProduct[]),
    api.getFaqs().catch(() => []),
  ]);

  const get = (section: string, key: string) => getSectionValue(sec as PageSections, section, key, l);

  const impacts = ['10eur', '30eur', '100eur', '500eur'];

  const otherWays = [
    { key: 'volunteer', icon: '🙋' },
    { key: 'companies', icon: '🏢' },
    { key: 'spread', icon: '📣' },
  ];

  return (
    <div>
      <PageViewTracker eventName="vista_donacion" />
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">{get('hero', 'title') || t(l, 'collaborate.title')}</h1>
          <p className="text-xl text-primary-100">{get('hero', 'subtitle') || t(l, 'collaborate.subtitle')}</p>
        </div>
      </section>

      {/* Bank transfer */}
      <section className="py-12 bg-bg">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏦</span>
              <h2 className="text-lg font-bold text-gray-900">
                {get('donation', 'title') || t(l, 'collaborate.bankTransfer')}
              </h2>
            </div>
            {get('donation', 'text') && (
              <p className="text-sm text-gray-500 mb-4">{get('donation', 'text')}</p>
            )}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: t(l, 'collaborate.holder'), value: settings.bankAccount || 'Fundación Luz de Benín' },
                { label: t(l, 'collaborate.iban'),   value: settings.bankIban    || 'ES12 3456 7890 1234 5678 9012' },
                { label: t(l, 'collaborate.bic'),    value: settings.bankBic     || 'CAIXESBBXXX' },
              ].map(({ label, value }) => (
                <div key={label} className="py-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="font-mono font-semibold text-primary-800 text-sm break-all">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed border-t border-gray-100 pt-4">
              {l === 'es'
                ? 'Indica tu nombre y correo en el concepto para que podamos enviarte el certificado de donación.'
                : 'Indiquez votre nom et email dans la référence pour que nous puissions vous envoyer le reçu fiscal.'}
            </p>
          </div>
        </div>
      </section>

      {/* Online donation widget */}
      <section className="py-4 pb-16 bg-bg">
        <div className="max-w-2xl mx-auto px-4">
          <DonationWidget lang={l} stripeProducts={stripeProducts} />
        </div>
      </section>

      {/* Teaming */}
      <section className="py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🤝</span>
            <h2 className="text-lg font-bold text-gray-900">
              {l === 'es' ? 'Dona 1€ al mes con Teaming' : 'Donnez 1€/mois avec Teaming'}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {l === 'es'
              ? 'Únete a nuestro grupo de Teaming y dona solo 1€ al mes. Pequeñas aportaciones, gran impacto.'
              : 'Rejoignez notre groupe Teaming et donnez seulement 1€ par mois. Petites contributions, grand impact.'}
          </p>
          <div className="flex justify-center">
            <iframe
              src={`https://www.teaming.net/group/spread/widgets/bvqIcViwX9ZhfHQMzYHOT52X0JmEzBeyUSme3FaZKnDXT/4?lang=${l === 'es' ? 'es_ES' : 'fr_FR'}&TM=true`}
              width={423}
              height={177}
              frameBorder={0}
              scrolling="no"
              loading="lazy"
              style={{ overflow: 'hidden', textAlign: 'center', maxWidth: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Tax deduction */}
      <TaxDeduction lang={l} />

      {/* Impact per donation */}
      <section className="py-16 bg-bg">
        <div className="max-w-4xl mx-auto px-4">
          <SectionTitle title={t(l, 'collaborate.impactTitle')} />
          <div className="grid sm:grid-cols-2 gap-4">
            {impacts.map((key) => {
              const text = get('impact', key);
              if (!text) return null;
              return (
                <div key={key} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other ways */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <SectionTitle title={t(l, 'collaborate.otherWays')} />
          <div className="grid md:grid-cols-3 gap-6">
            {otherWays.map(({ key, icon }) => (
              <div key={key} className="text-center p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{get(key, 'title') || t(l, `collaborate.${key}.title`)}</h3>
                <p className="text-sm text-gray-600">{get(key, 'desc') || t(l, `collaborate.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (() => {
        const items = faqs
          .map(f => ({ question: l === 'es' ? f.questionEs : f.questionFr, answer: l === 'es' ? f.answerEs : f.answerFr }))
          .filter(f => f.question && f.answer);
        if (items.length === 0) return null;
        return (
          <section className="py-16 bg-bg">
            <div className="max-w-3xl mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                  {l === 'es' ? 'Preguntas frecuentes' : 'Questions fréquentes'}
                </h2>
                <p className="text-gray-500">
                  {l === 'es' ? 'Resolvemos las dudas más habituales.' : 'Nous répondons aux questions les plus fréquentes.'}
                </p>
              </div>
              <FaqAccordion items={items} />
              <div className="text-center mt-8">
                <Link href={`/${l}/faq/`} className="text-sm text-primary-800 hover:text-accent font-medium transition-colors">
                  {l === 'es' ? 'Ver todas las preguntas →' : 'Voir toutes les questions →'}
                </Link>
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
}
