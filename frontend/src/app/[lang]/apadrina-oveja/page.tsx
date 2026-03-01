import type { Metadata } from 'next';
import Link from 'next/link';
import { Lang } from '@/lib/types';
import SponsorButton from '@/components/campaigns/SponsorButton';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';
const AMOUNT = 1000; // 10€ en céntimos

const copy = {
  es: {
    meta: {
      title: 'Apadrina una oveja en Benín — 10€/mes',
      description: 'Con 10€ al mes apadrina una oveja del nuevo rebaño de la Fundación Luz de Benín. Ayudas a construir el aprisco y dar autonomía económica a una comunidad rural. Sin permanencia. Deducible al 80%.',
    },
    hero: {
      tag: 'Nuevo proyecto',
      title: 'Apadrina una oveja en Benín',
      tagline: 'Tu oveja. Un rebaño. Un futuro para una comunidad.',
      price: '10€',
      period: 'al mes',
      cta: '🐑 Apadrinar una oveja por 10€/mes',
      fine: 'Sin permanencia · Cancela cuando quieras · Deducible hasta el 80% en el IRPF',
    },
    what: {
      title: '¿Qué cubre tu apadrinamiento?',
      items: [
        { icon: '🏗️', text: 'Construcción y mantenimiento del aprisco (cobertizo + cercado)' },
        { icon: '🌿', text: 'Alimentación mensual con hierba, paja y complementos minerales' },
        { icon: '💉', text: 'Vacunación, desparasitación y atención veterinaria' },
        { icon: '🤲', text: 'Formación de la comunidad local en ganadería sostenible' },
      ],
    },
    project: {
      title: 'El proyecto detrás de tu oveja',
      text: 'Estamos poniendo en marcha un nuevo proyecto de ganadería ovina en Benín. Un rebaño con su aprisco propio que generará lana, carne y leche para las comunidades rurales, dotándolas de autosuficiencia económica real. A diferencia de la ayuda puntual, un rebaño produce valor año tras año. Tu apadrinamiento hace que esto arranque.',
      badge: '🚀 Proyecto en fase de lanzamiento',
    },
    why: {
      title: '¿Por qué ovejas?',
      items: [
        { icon: '📈', text: 'Generan ingresos sostenibles: lana, leche y crías que se pueden vender' },
        { icon: '🌍', text: 'Se adaptan perfectamente al clima y terreno de Benín' },
        { icon: '👨‍👩‍👧', text: 'La comunidad aprende a gestionar el rebaño y se hace propietaria a largo plazo' },
        { icon: '🔄', text: 'El rebaño crece solo: cada oveja que nace es un beneficiario más' },
      ],
    },
    back: '← Volver al inicio',
    ctaBottom: '🐑 Apadrinar mi oveja por 10€/mes',
    ctaBottomNote: 'Serás redirigido/a a Stripe, plataforma de pago seguro. Sin permanencia, cancela cuando quieras.',
  },
  fr: {
    meta: {
      title: 'Parraine une brebis au Bénin — 10€/mois',
      description: 'Avec 10€ par mois, parraine une brebis du nouveau troupeau de la Fondation Lumière du Bénin. Tu aides à construire la bergerie et à donner l\'autonomie économique à une communauté rurale. Sans engagement. Déductible à 80%.',
    },
    hero: {
      tag: 'Nouveau projet',
      title: 'Parraine une brebis au Bénin',
      tagline: 'Ta brebis. Un troupeau. Un avenir pour une communauté.',
      price: '10€',
      period: 'par mois',
      cta: '🐑 Parrainer une brebis pour 10€/mois',
      fine: 'Sans engagement · Annule quand tu veux · Déductible jusqu\'à 80%',
    },
    what: {
      title: 'Que couvre ton parrainage ?',
      items: [
        { icon: '🏗️', text: 'Construction et entretien de la bergerie (abri + clôture)' },
        { icon: '🌿', text: 'Alimentation mensuelle avec herbe, paille et compléments minéraux' },
        { icon: '💉', text: 'Vaccination, déparasitage et soins vétérinaires' },
        { icon: '🤲', text: 'Formation de la communauté locale en élevage durable' },
      ],
    },
    project: {
      title: 'Le projet derrière ta brebis',
      text: 'Nous mettons en place un nouveau projet d\'élevage ovin au Bénin. Un troupeau avec sa propre bergerie qui produira de la laine, de la viande et du lait pour les communautés rurales, leur donnant une véritable autonomie économique. Contrairement à l\'aide ponctuelle, un troupeau produit de la valeur année après année. Ton parrainage fait démarrer tout ça.',
      badge: '🚀 Projet en phase de lancement',
    },
    why: {
      title: 'Pourquoi des brebis ?',
      items: [
        { icon: '📈', text: 'Génèrent des revenus durables : laine, lait et agneaux pouvant être vendus' },
        { icon: '🌍', text: 'S\'adaptent parfaitement au climat et au terrain du Bénin' },
        { icon: '👨‍👩‍👧', text: 'La communauté apprend à gérer le troupeau et en devient propriétaire à long terme' },
        { icon: '🔄', text: 'Le troupeau grandit seul : chaque agneau qui naît est un bénéficiaire de plus' },
      ],
    },
    back: '← Retour à l\'accueil',
    ctaBottom: '🐑 Parrainer ma brebis pour 10€/mois',
    ctaBottomNote: 'Vous serez redirigé(e) vers Stripe, plateforme de paiement sécurisé. Sans engagement, annulez quand vous voulez.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const c = copy[lang as Lang]?.meta ?? copy.es.meta;
  return {
    title: { absolute: c.title },
    description: c.description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/apadrina-oveja/`,
      languages: {
        'es': `${SITE_URL}/es/apadrina-oveja/`,
        'fr': `${SITE_URL}/fr/apadrina-oveja/`,
        'x-default': `${SITE_URL}/es/apadrina-oveja/`,
      },
    },
    openGraph: {
      title: c.title,
      description: c.description,
      url: `${SITE_URL}/${lang}/apadrina-oveja/`,
    },
  };
}

export default async function ApadrinaOvejaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const c = copy[l] ?? copy.es;

  return (
    <div>
      {/* Hero */}
      <section className="bg-green-50 py-20 border-b border-green-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Link href={`/${l}/`} className="text-xs text-green-700 hover:text-primary-800 mb-6 inline-block transition-colors">
            {c.back}
          </Link>
          <span className="inline-block bg-primary-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
            {c.hero.tag}
          </span>
          <div className="text-9xl mb-6 leading-none">🐑</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {c.hero.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">{c.hero.tagline}</p>
          <div className="inline-flex items-baseline gap-1 mb-8">
            <span className="text-6xl font-extrabold text-primary-800">{c.hero.price}</span>
            <span className="text-xl text-gray-500">{c.hero.period}</span>
          </div>
          <div className="mb-4">
            <SponsorButton
              lang={l}
              amount={AMOUNT}
              label={c.hero.cta}
              className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-bold px-10 py-4 rounded-full text-xl transition-colors shadow-xl shadow-primary-900/20 disabled:opacity-60"
            />
          </div>
          <p className="text-xs text-gray-400">{c.hero.fine}</p>
        </div>
      </section>

      {/* Qué cubre */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">{c.what.title}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {c.what.items.map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-4 bg-green-50 rounded-xl p-5 border border-green-100">
                <span className="text-3xl shrink-0">{icon}</span>
                <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* El proyecto */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-6">
            {c.project.badge}
          </span>
          <h2 className="text-2xl font-extrabold mb-4">{c.project.title}</h2>
          <p className="text-primary-100 leading-relaxed text-lg">{c.project.text}</p>
        </div>
      </section>

      {/* ¿Por qué ovejas? */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">{c.why.title}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {c.why.items.map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-3xl shrink-0">{icon}</span>
                <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-green-50 border-t border-green-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🐑</div>
          <SponsorButton
            lang={l}
            amount={AMOUNT}
            label={c.ctaBottom}
            className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-bold px-10 py-4 rounded-full text-xl transition-colors shadow-xl shadow-primary-900/20 disabled:opacity-60 mb-4"
          />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">{c.ctaBottomNote}</p>
        </div>
      </section>
    </div>
  );
}
