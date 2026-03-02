import Link from 'next/link';
import { Lang, Campaign } from '@/lib/types';

interface Props {
  lang: Lang;
  campaigns: Campaign[];
}

const strip = {
  es: {
    label: '✨ Campañas especiales',
    title: 'Apadrina, no dona. Hay diferencia.',
    subtitle: 'Elige tu animal, ponle nombre si quieres, y sabe exactamente qué financia tu dinero cada mes.',
    cta: 'Apadrinar',
  },
  fr: {
    label: '✨ Campagnes spéciales',
    title: 'Parraine, ne donne pas. La différence est importante.',
    subtitle: 'Choisis ton animal, donne-lui un nom si tu veux, et sache exactement ce que finance ton argent chaque mois.',
    cta: 'Parrainer',
  },
};

export default function CampaignsStrip({ lang, campaigns }: Props) {
  const c = strip[lang];

  if (!campaigns.length) return null;

  return (
    <section className="py-16 bg-amber-50 border-y border-amber-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <span className="inline-block bg-orange-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            {c.label}
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{c.title}</h2>
          <p className="text-gray-600 max-w-xl mx-auto">{c.subtitle}</p>
        </div>

        <div className={`grid gap-6 ${campaigns.length === 1 ? 'max-w-sm mx-auto' : 'sm:grid-cols-2'}`}>
          {campaigns.map(campaign => {
            const isAmber = campaign.colorScheme === 'amber';
            const title   = lang === 'fr' ? campaign.titleFr   : campaign.titleEs;
            const tagline = lang === 'fr' ? campaign.taglineFr : campaign.taglineEs;
            const ctaText = lang === 'fr' ? campaign.ctaFr     : campaign.ctaEs;
            const price   = `${campaign.priceLabel}/${lang === 'fr' ? 'mois' : 'mes'}`;

            return (
              <Link
                key={campaign.slug}
                href={`/${lang}/campanas/${campaign.slug}/`}
                className={`group bg-white rounded-2xl border-2 p-8 transition-all flex flex-col items-center text-center hover:shadow-lg ${
                  isAmber
                    ? 'border-amber-200 hover:border-accent'
                    : 'border-green-200 hover:border-primary-800'
                }`}
              >
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{campaign.emoji}</div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{tagline}</p>
                <span className={`text-3xl font-extrabold mb-4 ${isAmber ? 'text-accent' : 'text-primary-800'}`}>
                  {price}
                </span>
                <span className={`inline-block text-white font-bold px-6 py-2.5 rounded-full transition-colors ${
                  isAmber
                    ? 'bg-accent group-hover:bg-accent-700'
                    : 'bg-primary-800 group-hover:bg-primary-900'
                }`}>
                  {ctaText} →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
