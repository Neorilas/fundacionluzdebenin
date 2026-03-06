import type { Metadata } from 'next';
import { Lang, Settings, StripeProduct } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import SectionTitle from '@/components/ui/SectionTitle';
import TaxDeduction from '@/components/colabora/TaxDeduction';
import DonationWidget from '@/components/colabora/DonationWidget';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr ? 'Faire un Don' : 'Colabora y Dona';
  const description = isFr
    ? "Faites un don à la Fondation Lumière du Bénin. Déductible fiscalement à 80 %. Chaque euro compte pour les orphelinats, les mères célibataires et les projets de développement au Bénin."
    : 'Dona a la Fundación Luz de Benín. Deducible al 80% en el IRPF. Cada euro cuenta para los orfanatos, madres solteras y proyectos de desarrollo en Benín.';
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/colabora/`,
      languages: {
        'es': `${SITE_URL}/es/colabora/`,
        'fr': `${SITE_URL}/fr/colabora/`,
        'x-default': `${SITE_URL}/es/colabora/`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}/${lang}/colabora/` },
  };
}

export default async function ColaboraPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;

  const [sec, settings, stripeProducts] = await Promise.all([
    api.getPageSections('colabora').catch(() => ({})),
    api.getSettings().catch(() => ({} as Settings)),
    api.getStripeProducts().catch(() => [] as StripeProduct[]),
  ]);

  const get = (section: string, key: string) => {
    const s = (sec as Record<string, Record<string, { es: string; fr: string }>>)[section]?.[key];
    return s ? (l === 'es' ? s.es : s.fr) : '';
  };

  const impacts = ['10eur', '30eur', '100eur', '500eur'];

  const otherWays = [
    { key: 'volunteer', icon: '🙋' },
    { key: 'companies', icon: '🏢' },
    { key: 'spread', icon: '📣' },
  ];

  return (
    <div>
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
    </div>
  );
}
