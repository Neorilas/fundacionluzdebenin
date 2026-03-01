import type { Metadata } from 'next';
import Link from 'next/link';
import { Lang } from '@/lib/types';
import SponsorButton from '@/components/campaigns/SponsorButton';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';
const AMOUNT = 500; // 5€ en céntimos

const copy = {
  es: {
    meta: {
      title: 'Apadrina una gallina en Benín — 5€/mes',
      description: 'Con 5€ al mes apadrina una gallina en la granja de la Fundación Luz de Benín. Sus huevos alimentan a niños en orfanatos. Sin permanencia. Deducible al 80%.',
    },
    hero: {
      tag: 'Campaña especial',
      title: 'Apadrina una gallina en Benín',
      tagline: 'Tu gallina pone huevos. Los huevos alimentan niños.',
      price: '5€',
      period: 'al mes',
      cta: '🐔 Apadrinar una gallina por 5€/mes',
      fine: 'Sin permanencia · Cancela cuando quieras · Deducible hasta el 80% en el IRPF',
    },
    what: {
      title: '¿Qué cubre tu apadrinamiento?',
      items: [
        { icon: '🌽', text: 'Alimentación diaria con maíz, sorgo y complementos vitamínicos' },
        { icon: '💉', text: 'Vacunación y seguimiento veterinario mensual' },
        { icon: '🏡', text: 'Mantenimiento de las instalaciones del gallinero' },
        { icon: '🥚', text: 'Gestión de la producción de huevos para los orfanatos' },
      ],
    },
    project: {
      title: 'El proyecto detrás de tu gallina',
      text: 'Nuestra granja avícola en Benín tiene más de 2.500 gallinas y produce más de 300.000 huevos al año. Esos huevos van directamente a alimentar a los niños de los 4 orfanatos que apoyamos, y el excedente se vende para financiar todos nuestros proyectos de desarrollo. No es una metáfora: tu gallina produce huevos reales para niños reales.',
      link: 'Ver el proyecto de la granja →',
      href: '/proyectos/granja-avicola-sostenible/',
    },
    stats: [
      { value: '2.500+', label: 'gallinas en la granja' },
      { value: '+300.000', label: 'huevos al año' },
      { value: '4', label: 'orfanatos alimentados' },
    ],
    back: '← Volver al inicio',
    ctaBottom: '🐔 Apadrinar mi gallina por 5€/mes',
    ctaBottomNote: 'Serás redirigido/a a Stripe, plataforma de pago seguro. Sin permanencia, cancela cuando quieras.',
  },
  fr: {
    meta: {
      title: 'Parraine une poule au Bénin — 5€/mois',
      description: 'Avec 5€ par mois, parraine une poule dans la ferme de la Fondation Lumière du Bénin. Ses œufs nourrissent des enfants dans des orphelinats. Sans engagement. Déductible à 80%.',
    },
    hero: {
      tag: 'Campagne spéciale',
      title: 'Parraine une poule au Bénin',
      tagline: 'Ta poule pond des œufs. Les œufs nourrissent des enfants.',
      price: '5€',
      period: 'par mois',
      cta: '🐔 Parrainer une poule pour 5€/mois',
      fine: 'Sans engagement · Annule quand tu veux · Déductible jusqu\'à 80%',
    },
    what: {
      title: 'Que couvre ton parrainage ?',
      items: [
        { icon: '🌽', text: 'Alimentation quotidienne avec du maïs, du sorgho et des compléments vitaminés' },
        { icon: '💉', text: 'Vaccination et suivi vétérinaire mensuel' },
        { icon: '🏡', text: 'Entretien des installations du poulailler' },
        { icon: '🥚', text: 'Gestion de la production d\'œufs pour les orphelinats' },
      ],
    },
    project: {
      title: 'Le projet derrière ta poule',
      text: 'Notre ferme avicole au Bénin compte plus de 2 500 poules et produit plus de 300 000 œufs par an. Ces œufs vont directement nourrir les enfants des 4 orphelinats que nous soutenons, et l\'excédent est vendu pour financer tous nos projets de développement. Ce n\'est pas une métaphore : ta poule produit de vrais œufs pour de vrais enfants.',
      link: 'Voir le projet de la ferme →',
      href: '/proyectos/granja-avicola-sostenible/',
    },
    stats: [
      { value: '2 500+', label: 'poules dans la ferme' },
      { value: '+300 000', label: 'œufs par an' },
      { value: '4', label: 'orphelinats nourris' },
    ],
    back: '← Retour à l\'accueil',
    ctaBottom: '🐔 Parrainer ma poule pour 5€/mois',
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
      canonical: `${SITE_URL}/${lang}/apadrina-gallina/`,
      languages: {
        'es': `${SITE_URL}/es/apadrina-gallina/`,
        'fr': `${SITE_URL}/fr/apadrina-gallina/`,
        'x-default': `${SITE_URL}/es/apadrina-gallina/`,
      },
    },
    openGraph: {
      title: c.title,
      description: c.description,
      url: `${SITE_URL}/${lang}/apadrina-gallina/`,
    },
  };
}

export default async function ApadrinaGallinaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const c = copy[l] ?? copy.es;

  return (
    <div>
      {/* Hero */}
      <section className="bg-amber-50 py-20 border-b border-amber-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Link href={`/${l}/`} className="text-xs text-amber-700 hover:text-accent mb-6 inline-block transition-colors">
            {c.back}
          </Link>
          <span className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
            {c.hero.tag}
          </span>
          <div className="text-9xl mb-6 leading-none">🐔</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {c.hero.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">{c.hero.tagline}</p>
          <div className="inline-flex items-baseline gap-1 mb-8">
            <span className="text-6xl font-extrabold text-accent">{c.hero.price}</span>
            <span className="text-xl text-gray-500">{c.hero.period}</span>
          </div>
          <div className="mb-4">
            <SponsorButton
              lang={l}
              amount={AMOUNT}
              label={c.hero.cta}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-700 text-white font-bold px-10 py-4 rounded-full text-xl transition-colors shadow-xl shadow-accent/30 disabled:opacity-60"
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
              <div key={text} className="flex items-start gap-4 bg-amber-50 rounded-xl p-5 border border-amber-100">
                <span className="text-3xl shrink-0">{icon}</span>
                <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-12 bg-primary-800 text-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {c.stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 mb-1">{value}</div>
                <div className="text-xs text-primary-200 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* El proyecto */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{c.project.title}</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">{c.project.text}</p>
          <Link
            href={`/${l}${c.project.href}`}
            className="text-sm font-semibold text-primary-800 hover:text-accent transition-colors"
          >
            {c.project.link}
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-amber-50 border-t border-amber-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🐔</div>
          <SponsorButton
            lang={l}
            amount={AMOUNT}
            label={c.ctaBottom}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-700 text-white font-bold px-10 py-4 rounded-full text-xl transition-colors shadow-xl shadow-accent/30 disabled:opacity-60 mb-4"
          />
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">{c.ctaBottomNote}</p>
        </div>
      </section>
    </div>
  );
}
