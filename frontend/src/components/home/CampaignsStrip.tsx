import Link from 'next/link';
import { Lang } from '@/lib/types';

interface Props {
  lang: Lang;
}

const copy = {
  es: {
    label: '✨ Campañas especiales',
    title: 'Apadrina, no dona. Hay diferencia.',
    subtitle: 'Elige tu animal, ponle nombre si quieres, y sabe exactamente qué financia tu dinero cada mes.',
    gallina: {
      emoji: '🐔',
      title: 'Apadrina una gallina',
      tagline: 'Tu gallina pone huevos. Los huevos alimentan niños.',
      price: '5€/mes',
      cta: 'Apadrinar una gallina',
    },
    oveja: {
      emoji: '🐑',
      title: 'Apadrina una oveja',
      tagline: 'Tu oveja. Un rebaño. Un futuro para una comunidad.',
      price: '10€/mes',
      cta: 'Apadrinar una oveja',
    },
  },
  fr: {
    label: '✨ Campagnes spéciales',
    title: 'Parraine, ne donne pas. La différence est importante.',
    subtitle: 'Choisis ton animal, donne-lui un nom si tu veux, et sache exactement ce que finance ton argent chaque mois.',
    gallina: {
      emoji: '🐔',
      title: 'Parraine une poule',
      tagline: 'Ta poule pond des œufs. Les œufs nourrissent des enfants.',
      price: '5€/mois',
      cta: 'Parrainer une poule',
    },
    oveja: {
      emoji: '🐑',
      title: 'Parraine une brebis',
      tagline: 'Ta brebis. Un troupeau. Un avenir pour une communauté.',
      price: '10€/mois',
      cta: 'Parrainer une brebis',
    },
  },
};

export default function CampaignsStrip({ lang }: Props) {
  const c = copy[lang];

  return (
    <section className="py-16 bg-amber-50 border-y border-amber-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <span className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            {c.label}
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{c.title}</h2>
          <p className="text-gray-600 max-w-xl mx-auto">{c.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Gallina */}
          <Link
            href={`/${lang}/apadrina-gallina/`}
            className="group bg-white rounded-2xl border-2 border-amber-200 hover:border-accent hover:shadow-lg p-8 transition-all flex flex-col items-center text-center"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{c.gallina.emoji}</div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{c.gallina.title}</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">{c.gallina.tagline}</p>
            <span className="text-3xl font-extrabold text-accent mb-4">{c.gallina.price}</span>
            <span className="inline-block bg-accent text-white font-bold px-6 py-2.5 rounded-full group-hover:bg-accent-700 transition-colors">
              {c.gallina.cta} →
            </span>
          </Link>

          {/* Oveja */}
          <Link
            href={`/${lang}/apadrina-oveja/`}
            className="group bg-white rounded-2xl border-2 border-green-200 hover:border-primary-800 hover:shadow-lg p-8 transition-all flex flex-col items-center text-center"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{c.oveja.emoji}</div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{c.oveja.title}</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">{c.oveja.tagline}</p>
            <span className="text-3xl font-extrabold text-primary-800 mb-4">{c.oveja.price}</span>
            <span className="inline-block bg-primary-800 text-white font-bold px-6 py-2.5 rounded-full group-hover:bg-primary-900 transition-colors">
              {c.oveja.cta} →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
