import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import SectionTitle from '@/components/ui/SectionTitle';

export const revalidate = 60;

export default async function QuienesSomosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const sec = await api.getPageSections('quienes-somos').catch(() => ({}));
  const get = (section: string, key: string) => {
    const s = (sec as Record<string, Record<string, { es: string; fr: string }>>)[section]?.[key];
    return s ? (l === 'es' ? s.es : s.fr) : '';
  };

  const timeline = l === 'es'
    ? [
        { year: '2012', event: 'Fundación de la organización por cooperantes españoles con experiencia en Benín' },
        { year: '2014', event: 'Primer proyecto de construcción de escuela en Cotonou' },
        { year: '2016', event: 'Ampliación del programa de salud materno-infantil' },
        { year: '2018', event: 'Lanzamiento del programa de becas universitarias' },
        { year: '2020', event: 'Superamos los 1.000 beneficiarios directos anuales' },
        { year: '2024', event: 'Más de 45 proyectos completados y 15 aldeas atendidas' },
      ]
    : [
        { year: '2012', event: 'Fondation de l\'organisation par des coopérants espagnols expérimentés au Bénin' },
        { year: '2014', event: 'Premier projet de construction d\'école à Cotonou' },
        { year: '2016', event: 'Expansion du programme de santé materno-infantile' },
        { year: '2018', event: 'Lancement du programme de bourses universitaires' },
        { year: '2020', event: 'Plus de 1 000 bénéficiaires directs annuels' },
        { year: '2024', event: 'Plus de 45 projets réalisés et 15 villages accompagnés' },
      ];

  const values = l === 'es'
    ? [
        { icon: '🤝', title: 'Compromiso', desc: 'Comprometidos con las comunidades que servimos a largo plazo.' },
        { icon: '🌱', title: 'Sostenibilidad', desc: 'Proyectos que perduran más allá de nuestra intervención.' },
        { icon: '🔍', title: 'Transparencia', desc: 'Rendición de cuentas total a nuestros donantes y comunidades.' },
        { icon: '🌍', title: 'Dignidad', desc: 'Respeto absoluto por la cultura y valores locales.' },
      ]
    : [
        { icon: '🤝', title: 'Engagement', desc: 'Engagés envers les communautés que nous servons sur le long terme.' },
        { icon: '🌱', title: 'Durabilité', desc: 'Des projets qui perdurent au-delà de notre intervention.' },
        { icon: '🔍', title: 'Transparence', desc: 'Reddition de comptes totale envers nos donateurs et communautés.' },
        { icon: '🌍', title: 'Dignité', desc: 'Respect absolu de la culture et des valeurs locales.' },
      ];

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
              <div><span className="font-medium">{t(l, 'whoWeAre.nif')}:</span> G12345678</div>
              <div><span className="font-medium">{t(l, 'whoWeAre.registration')}:</span> {l === 'es' ? 'Registro de Fundaciones nº 1234' : 'Registre des Fondations nº 1234'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
