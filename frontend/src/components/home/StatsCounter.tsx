import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
}

const stats = {
  es: [
    { icon: '🏠', value: '4', label: 'orfanatos atendidos en Benín' },
    { icon: '👦', value: 'Decenas', label: 'de niños con mejor calidad de vida' },
    { icon: '🐔', value: '2.500', label: 'gallinas en nuestra granja' },
    { icon: '🥚', value: '+300.000', label: 'huevos producidos al año' },
  ],
  fr: [
    { icon: '🏠', value: '4', label: 'orphelinats accompagnés au Bénin' },
    { icon: '👦', value: 'Des dizaines', label: "d'enfants avec une meilleure qualité de vie" },
    { icon: '🐔', value: '2 500', label: 'poules dans notre ferme avicole' },
    { icon: '🥚', value: '+300 000', label: 'œufs produits par an' },
  ],
};

export default function StatsCounter({ lang }: Props) {
  const items = stats[lang];

  return (
    <section className="py-16 bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          {t(lang, 'home.stats')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map(({ icon, value, label }) => (
            <div key={label} className="text-center p-6 rounded-2xl bg-white border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{icon}</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-primary-800 mb-2 leading-tight">
                {value}
              </div>
              <div className="text-sm text-muted leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
