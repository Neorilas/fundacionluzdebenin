import type { Metadata } from 'next';
import Link from 'next/link';
import { Lang, Campaign } from '@/lib/types';
import { api } from '@/lib/api';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'fr' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr ? 'Nos campagnes de parrainage' : 'Campañas de apadrinamiento';
  const description = isFr
    ? 'Parrainez un animal de ferme et soutenez les familles bénéficiaires de nos projets. Chaque parrainage a un impact direct et durable.'
    : 'Apadrina un animal de granja y apoya a las familias beneficiarias de nuestros proyectos. Cada apadrinamiento tiene un impacto directo y duradero.';
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/campanas/`,
      languages: {
        es: `${SITE_URL}/es/campanas/`,
        fr: `${SITE_URL}/fr/campanas/`,
        'x-default': `${SITE_URL}/es/campanas/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/campanas/`,
      images: [{ url: `${SITE_URL}/logo.jpg`, alt: title }],
    },
  };
}

function CampaignCard({ campaign, lang }: { campaign: Campaign; lang: Lang }) {
  const isFr = lang === 'fr';
  const isAmber = campaign.colorScheme === 'amber';
  const title = isFr ? campaign.titleFr : campaign.titleEs;
  const tagline = isFr ? campaign.taglineFr : campaign.taglineEs;
  const tag = isFr ? campaign.tagFr : campaign.tagEs;
  const cta = isFr ? campaign.ctaFr : campaign.ctaEs;

  const cardBorder = isAmber ? 'border-amber-200 hover:border-amber-400' : 'border-green-200 hover:border-green-400';
  const tagBg = isAmber ? 'bg-orange-700 text-white' : 'bg-primary-800 text-white';
  const priceColor = isAmber ? 'text-accent' : 'text-primary-800';
  const btnClass = isAmber
    ? 'bg-accent hover:bg-accent/90 text-white'
    : 'bg-primary-800 hover:bg-primary-900 text-white';

  return (
    <Link
      href={`/${lang}/campanas/${campaign.slug}/`}
      className={`group bg-white border-2 ${cardBorder} rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:shadow-lg`}
    >
      <div className="text-7xl mb-4 leading-none">{campaign.emoji}</div>
      {tag && (
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 ${tagBg}`}>
          {tag}
        </span>
      )}
      <h2 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">{title}</h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{tagline}</p>
      <div className="mb-6">
        <span className={`text-4xl font-extrabold ${priceColor}`}>{campaign.priceLabel}</span>
      </div>
      <span className={`${btnClass} font-semibold px-6 py-3 rounded-full text-sm transition-colors w-full text-center`}>
        {cta || (isFr ? 'Parrainer' : 'Apadrinar')}
      </span>
    </Link>
  );
}

export default async function CampanasPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang as Lang;
  const isFr = l === 'fr';

  const campaigns = await api.getCampaigns().catch(() => [] as Campaign[]);
  const active = campaigns.filter(c => c.active).sort((a, b) => a.sortOrder - b.sortOrder);

  const heroTitle = isFr ? 'Nos campagnes de parrainage' : 'Campañas de apadrinamiento';
  const heroSub = isFr
    ? 'Chaque parrainage est un geste concret qui change une vie. Choisissez votre campagne et rejoignez notre communauté de solidarité.'
    : 'Cada apadrinamiento es un gesto concreto que cambia una vida. Elige tu campaña y únete a nuestra comunidad solidaria.';
  const emptyMsg = isFr ? 'Aucune campagne active pour le moment.' : 'No hay campañas activas en este momento.';

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">{heroTitle}</h1>
          <p className="text-xl text-primary-100 leading-relaxed">{heroSub}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-bg">
        <div className="max-w-5xl mx-auto px-4">
          {active.length === 0 ? (
            <p className="text-center text-gray-400 py-16">{emptyMsg}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {active.map(c => (
                <CampaignCard key={c.id} campaign={c} lang={l} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
