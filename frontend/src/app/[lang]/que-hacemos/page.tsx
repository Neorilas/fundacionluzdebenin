import type { Metadata } from 'next';
import { Lang, PageSections, SITE_URL, getSectionValue } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import SectionTitle from '@/components/ui/SectionTitle';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr
    ? 'Ce que nous faisons — Éducation, animaux et développement durable au Bénin'
    : 'Qué hacemos — Educación, animales y desarrollo sostenible en Benín';
  const description = isFr
    ? "Découvrez nos trois axes d'action au Bénin : soutien aux orphelinats, accompagnement des mères célibataires et développement d'une économie durable grâce à notre ferme avicole."
    : 'Conoce nuestras tres áreas de trabajo en Benín: apoyo a orfanatos, acompañamiento a madres solteras y desarrollo de una economía sostenible con nuestra granja avícola.';
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/que-hacemos/`,
      languages: {
        'es': `${SITE_URL}/es/que-hacemos/`,
        'fr': `${SITE_URL}/fr/que-hacemos/`,
        'x-default': `${SITE_URL}/es/que-hacemos/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/que-hacemos/`,
      images: [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 600, alt: title }],
    },
  };
}

export default async function QueHacemosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const sec: PageSections = await api.getPageSections('que-hacemos').catch(() => ({} as PageSections));
  const get = (section: string, key: string) => getSectionValue(sec, section, key, l);

  const pillars = [
    { key: 'education', icon: get('education', 'icon') || '📚', color: 'bg-blue-50 border-blue-200' },
    { key: 'health', icon: get('health', 'icon') || '🏥', color: 'bg-green-50 border-green-200' },
    { key: 'development', icon: get('development', 'icon') || '🌱', color: 'bg-yellow-50 border-yellow-200' },
  ];

  const methodology = (['step1', 'step2', 'step3', 'step4'] as const)
    .map(k => get('methodology', k)).filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">{get('hero', 'title') || t(l, 'whatWeDo.title')}</h1>
          <p className="text-xl text-primary-100">{get('hero', 'subtitle')}</p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={l === 'es' ? 'Nuestras Áreas de Trabajo' : 'Nos Domaines de Travail'} />
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map(({ key, icon, color }) => (
              <div key={key} className={`${color} border rounded-2xl p-8`}>
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{get(key, 'title')}</h3>
                <p className="text-gray-600 leading-relaxed">{get(key, 'text')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title={t(l, 'whatWeDo.methodology')} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {methodology.map((step, i) => (
              <div key={i} className="bg-white rounded-xl p-5 text-center border border-primary-100">
                <div className="w-10 h-10 bg-primary-800 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
