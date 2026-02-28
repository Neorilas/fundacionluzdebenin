import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import SectionTitle from '@/components/ui/SectionTitle';

export const revalidate = 60;

export default async function QueHacemosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const sec = await api.getPageSections('que-hacemos').catch(() => ({}));
  const get = (section: string, key: string) => {
    const s = (sec as Record<string, Record<string, { es: string; fr: string }>>)[section]?.[key];
    return s ? (l === 'es' ? s.es : s.fr) : '';
  };

  const pillars = [
    { key: 'education', icon: '📚', color: 'bg-blue-50 border-blue-200' },
    { key: 'health', icon: '🏥', color: 'bg-green-50 border-green-200' },
    { key: 'development', icon: '🌱', color: 'bg-yellow-50 border-yellow-200' },
  ];

  const methodology = l === 'es'
    ? ['Diagnóstico participativo con la comunidad', 'Diseño colaborativo del proyecto', 'Implementación con personal local', 'Evaluación y transferencia a la comunidad']
    : ['Diagnostic participatif avec la communauté', 'Conception collaborative du projet', 'Mise en œuvre avec du personnel local', 'Évaluation et transfert à la communauté'];

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
