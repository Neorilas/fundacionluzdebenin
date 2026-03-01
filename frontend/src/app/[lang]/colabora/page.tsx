import { Lang, Settings, StripeProduct } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import SectionTitle from '@/components/ui/SectionTitle';
import TaxDeduction from '@/components/colabora/TaxDeduction';
import DonationWidget from '@/components/colabora/DonationWidget';

export const revalidate = 60;

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

      {/* Donation widget — shown first */}
      <DonationWidget lang={l} stripeProducts={stripeProducts} />

      {/* Bank transfer */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <SectionTitle title={get('donation', 'title') || t(l, 'collaborate.bankTransfer')} centered={false} />
          <p className="text-gray-600 mb-6">{get('donation', 'text')}</p>
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 space-y-3">
            {[
              { label: t(l, 'collaborate.holder'), value: settings.bankAccount || 'Fundación Luz de Benín' },
              { label: t(l, 'collaborate.iban'), value: settings.bankIban || 'ES12 3456 7890 1234 5678 9012' },
              { label: t(l, 'collaborate.bic'), value: settings.bankBic || 'CAIXESBBXXX' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-primary-100 last:border-0">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className="font-mono font-semibold text-primary-800">{value}</span>
              </div>
            ))}
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
                <h3 className="font-bold text-gray-900 mb-2">{t(l, `collaborate.${key}.title`)}</h3>
                <p className="text-sm text-gray-600">{t(l, `collaborate.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
