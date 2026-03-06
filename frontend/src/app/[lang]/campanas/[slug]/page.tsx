import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lang, Campaign, StatItem, WhyItem } from '@/lib/types';
import { api } from '@/lib/api';
import SponsorButton from '@/components/campaigns/SponsorButton';
import ShareButtons from '@/components/campaigns/ShareButtons';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateStaticParams() {
  try {
    const campaigns = await api.getCampaigns();
    const langs = ['es', 'fr'];
    return campaigns.flatMap(c => langs.map(lang => ({ lang, slug: c.slug })));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  let campaign: Campaign | null = null;
  try {
    campaign = await api.getCampaign(slug);
  } catch { /* not found */ }
  if (!campaign) return {};

  const isFr = lang === 'fr';
  const title = isFr ? campaign.metaTitleFr : campaign.metaTitleEs;
  const description = isFr ? campaign.metaDescFr : campaign.metaDescEs;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/campanas/${slug}/`,
      languages: {
        es: `${SITE_URL}/es/campanas/${slug}/`,
        fr: `${SITE_URL}/fr/campanas/${slug}/`,
        'x-default': `${SITE_URL}/es/campanas/${slug}/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/campanas/${slug}/`,
      images: [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 533, alt: title }],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/logo.jpg`] },
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const l = lang as Lang;

  let campaign: Campaign;
  try {
    campaign = await api.getCampaign(slug);
  } catch {
    notFound();
  }

  const isFr = l === 'fr';
  const isAmber = campaign.colorScheme === 'amber';

  // Color tokens based on scheme
  const heroBg     = isAmber ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100';
  const tagBg      = isAmber ? 'bg-orange-700 text-white' : 'bg-primary-800 text-white';
  const priceColor = isAmber ? 'text-accent' : 'text-primary-800';
  const backColor  = isAmber ? 'text-amber-700 hover:text-accent' : 'text-green-700 hover:text-primary-800';
  const coverBg    = isAmber ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100';
  const btnClass   = isAmber
    ? 'inline-flex items-center gap-2 bg-accent hover:bg-accent-700 text-white font-bold px-10 py-4 rounded-full text-xl transition-colors shadow-xl shadow-accent/30 disabled:opacity-60'
    : 'inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-bold px-10 py-4 rounded-full text-xl transition-colors shadow-xl shadow-primary-900/20 disabled:opacity-60';
  const ctaBg      = isAmber ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100';

  const title   = isFr ? campaign.titleFr   : campaign.titleEs;
  const tagline = isFr ? campaign.taglineFr : campaign.taglineEs;
  const tag     = isFr ? campaign.tagFr     : campaign.tagEs;
  const period  = isFr ? campaign.periodFr  : campaign.periodEs;
  const cta     = isFr ? campaign.ctaFr     : campaign.ctaEs;
  const fine    = isFr ? campaign.fineFr    : campaign.fineEs;

  const projectTitle = isFr ? campaign.projectTitleFr : campaign.projectTitleEs;
  const projectText  = isFr ? campaign.projectTextFr  : campaign.projectTextEs;
  const projectBadge = isFr ? campaign.projectBadgeFr : campaign.projectBadgeEs;
  const projectLink  = isFr ? campaign.projectLinkFr  : campaign.projectLinkEs;

  const extraTitle = isFr ? campaign.extraTitleFr : campaign.extraTitleEs;
  const ctaBottom  = isFr ? campaign.ctaBottomFr  : campaign.ctaBottomEs;
  const ctaBottomNote = isFr ? campaign.ctaBottomNoteFr : campaign.ctaBottomNoteEs;
  const backLabel  = isFr ? '← Retour à l\'accueil' : '← Volver al inicio';
  const coverTitle = isFr ? 'Que couvre ton parrainage ?' : '¿Qué cubre tu apadrinamiento?';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    name: title,
    description: tagline,
    url: `${SITE_URL}/${l}/campanas/${slug}/`,
    price: (campaign.amountCents / 100).toFixed(2),
    priceCurrency: 'EUR',
    recipient: {
      '@type': 'NGO',
      name: 'Fundación Luz de Benín',
      alternateName: 'Fondation Lumière du Bénin',
      url: SITE_URL,
    },
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div>
      {/* Hero */}
      <section className={`py-20 border-b ${heroBg}`}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Link href={`/${l}/`} className={`text-xs mb-6 inline-block transition-colors ${backColor}`}>
            {backLabel}
          </Link>
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 ${tagBg}`}>
            {tag}
          </span>
          <div className="text-9xl mb-6 leading-none">{campaign.emoji}</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">{tagline}</p>
          <div className="inline-flex items-baseline gap-1 mb-8">
            <span className={`text-6xl font-extrabold ${priceColor}`}>{campaign.priceLabel}</span>
            <span className="text-xl text-gray-500">{period}</span>
          </div>
          <div className="mb-4">
            <SponsorButton lang={l} amount={campaign.amountCents} label={cta} className={btnClass} showAnimalName />
          </div>
          <p className="text-xs text-gray-400">{fine}</p>
          <ShareButtons
            lang={l}
            title={title}
            url={`${SITE_URL}/${l}/campanas/${slug}/`}
          />
        </div>
      </section>

      {/* Qué cubre */}
      {campaign.coverItems.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">{coverTitle}</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {campaign.coverItems.map((item, i) => (
                <div key={i} className={`flex items-start gap-4 rounded-xl p-5 border ${coverBg}`}>
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {isFr ? item.textFr : item.textEs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Extra: estadísticas */}
      {campaign.extraType === 'stats' && campaign.extraItems.length > 0 && (
        <section className="py-12 bg-primary-800 text-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className={`grid grid-cols-${campaign.extraItems.length} gap-6 text-center`}>
              {(campaign.extraItems as StatItem[]).map((item, i) => (
                <div key={i}>
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 mb-1">{item.value}</div>
                  <div className="text-xs text-primary-200 leading-tight">
                    {isFr ? item.labelFr : item.labelEs}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sección proyecto */}
      {(projectTitle || projectText) && (
        <section className={`py-16 ${campaign.extraType === 'stats' ? 'bg-white' : 'bg-primary-800 text-white'}`}>
          {campaign.extraType === 'stats' ? (
            <div className="max-w-2xl mx-auto px-4">
              {projectBadge && (
                <span className="inline-block bg-primary-50 border border-primary-100 text-primary-800 text-xs font-bold px-3 py-1 rounded-full mb-6">
                  {projectBadge}
                </span>
              )}
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{projectTitle}</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">{projectText}</p>
              {campaign.projectHref && projectLink && (
                <Link href={`/${l}${campaign.projectHref}`}
                  className="text-sm font-semibold text-primary-800 hover:text-accent transition-colors">
                  {projectLink}
                </Link>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4 text-center">
              {projectBadge && (
                <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-6">
                  {projectBadge}
                </span>
              )}
              <h2 className="text-2xl font-extrabold mb-4">{projectTitle}</h2>
              <p className="text-primary-100 leading-relaxed text-lg">{projectText}</p>
              {campaign.projectHref && projectLink && (
                <Link href={`/${l}${campaign.projectHref}`}
                  className="mt-6 inline-block text-sm font-semibold text-white/80 hover:text-white transition-colors">
                  {projectLink}
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {/* Extra: ¿Por qué? */}
      {campaign.extraType === 'why' && campaign.extraItems.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            {extraTitle && (
              <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">{extraTitle}</h2>
            )}
            <div className="grid sm:grid-cols-2 gap-5">
              {(campaign.extraItems as WhyItem[]).map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-3xl shrink-0">{item.icon}</span>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {isFr ? item.textFr : item.textEs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className={`py-20 border-t ${ctaBg}`}>
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">{campaign.emoji}</div>
          <SponsorButton lang={l} amount={campaign.amountCents} label={ctaBottom} className={`${btnClass} mb-4`} showAnimalName />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">{ctaBottomNote}</p>
          <ShareButtons
            lang={l}
            title={title}
            url={`${SITE_URL}/${l}/campanas/${slug}/`}
          />
        </div>
      </section>
    </div>
    </>
  );
}
