import type { Metadata } from 'next';
import { Lang, Settings } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import SectionTitle from '@/components/ui/SectionTitle';

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr ? 'Qui Sommes-Nous' : 'Quiénes Somos';
  const description = isFr
    ? "Fondée en 2012 par des coopérants espagnols, la Fondation Lumière du Bénin œuvre pour le développement durable des communautés rurales du Bénin depuis plus de 12 ans."
    : 'Fundada en 2012 por cooperantes españoles, la Fundación Luz de Benín lleva más de 12 años trabajando por el desarrollo sostenible de las comunidades rurales de Benín.';
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/quienes-somos/`,
      languages: {
        'es': `${SITE_URL}/es/quienes-somos/`,
        'fr': `${SITE_URL}/fr/quienes-somos/`,
        'x-default': `${SITE_URL}/es/quienes-somos/`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}/${lang}/quienes-somos/` },
  };
}

export default async function QuienesSomosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const [sec, settings] = await Promise.all([
    api.getPageSections('quienes-somos').catch(() => ({})),
    api.getSettings().catch(() => ({} as Settings)),
  ]);
  const get = (section: string, key: string) => {
    const s = (sec as Record<string, Record<string, { es: string; fr: string }>>)[section]?.[key];
    return s ? (l === 'es' ? s.es : s.fr) : '';
  };

  let timeline: { year: string; event: string }[] = [];
  try { timeline = JSON.parse(get('timeline', 'data') || '[]'); } catch { timeline = []; }

  const values = [1, 2, 3, 4].map(i => ({
    icon: get(`value${i}`, 'icon'),
    title: get(`value${i}`, 'title'),
    desc: get(`value${i}`, 'desc'),
  })).filter(v => v.title);

  return (
    <div>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">{get('hero', 'title') || t(l, 'whoWeAre.title')}</h1>
          <p className="text-xl text-primary-100">{get('hero', 'subtitle')}</p>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={get('history', 'title') || t(l, 'whoWeAre.legal')} centered={false} />
          <p className="text-gray-600 leading-relaxed text-lg mb-10">{get('history', 'text')}</p>
          <div className="space-y-4">
            {timeline.map(({ year, event }) => (
              <div key={year} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-16 font-bold text-primary-800 text-right">{year}</div>
                <div className="flex-shrink-0 w-px bg-primary-200 self-stretch" />
                <p className="text-gray-700 pb-4">{event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={t(l, 'whoWeAre.values')} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 text-center border border-primary-100">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-bold text-primary-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal info */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">{t(l, 'whoWeAre.legal')}</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div><span className="font-medium">{t(l, 'whoWeAre.nif')}:</span> {settings.foundationNif || 'G12345678'}</div>
              <div><span className="font-medium">{t(l, 'whoWeAre.registration')}:</span> {settings.foundationRegistry || (l === 'es' ? 'Registro de Fundaciones nº 1234' : 'Registre des Fondations nº 1234')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
