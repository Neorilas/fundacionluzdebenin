import Link from 'next/link';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
  sec?: any;
}

const ladder = {
  es: [
    { amount: '10€', icon: '📚', impact: 'Cuadernos y útiles escolares para un niño durante un trimestre' },
    { amount: '30€', icon: '🍽️', impact: 'Alimentación mensual de un niño en el orfanato' },
    { amount: '60€', icon: '💊', impact: 'Medicamentos y atención sanitaria durante un mes' },
    { amount: '100€', icon: '🐔', impact: 'Financias la compra de 10 gallinas para la granja' },
  ],
  fr: [
    { amount: '10€', icon: '📚', impact: "Cahiers et fournitures scolaires pour un enfant pendant un trimestre" },
    { amount: '30€', icon: '🍽️', impact: "Alimentation mensuelle d'un enfant à l'orphelinat" },
    { amount: '60€', icon: '💊', impact: "Médicaments et soins de santé pendant un mois" },
    { amount: '100€', icon: '🐔', impact: "Vous financez l'achat de 10 poules pour la ferme" },
  ],
};

export default function DonationCTA({ lang, sec }: Props) {
  const sectionTitle = sec?.donationCta?.sectionTitle?.[lang] || (lang === 'es' ? 'Tu donación en acción' : 'Votre don en action');
  const bottomText = sec?.donationCta?.bottomText?.[lang] || (lang === 'es' ? 'Transferencia bancaria · 100% destinado a proyectos' : 'Virement bancaire · 100% destiné aux projets');
  const items = [
    { amount: sec?.impact1?.amount?.[lang] || ladder[lang][0].amount, icon: sec?.impact1?.icon?.[lang] || ladder[lang][0].icon, impact: sec?.impact1?.text?.[lang] || ladder[lang][0].impact },
    { amount: sec?.impact2?.amount?.[lang] || ladder[lang][1].amount, icon: sec?.impact2?.icon?.[lang] || ladder[lang][1].icon, impact: sec?.impact2?.text?.[lang] || ladder[lang][1].impact },
    { amount: sec?.impact3?.amount?.[lang] || ladder[lang][2].amount, icon: sec?.impact3?.icon?.[lang] || ladder[lang][2].icon, impact: sec?.impact3?.text?.[lang] || ladder[lang][2].impact },
    { amount: sec?.impact4?.amount?.[lang] || ladder[lang][3].amount, icon: sec?.impact4?.icon?.[lang] || ladder[lang][3].icon, impact: sec?.impact4?.text?.[lang] || ladder[lang][3].impact },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            {sectionTitle}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            {t(lang, 'home.donationCTA.title')}
          </h2>
          <p className="text-lg text-primary-200 max-w-xl mx-auto leading-relaxed">
            {t(lang, 'home.donationCTA.subtitle')}
          </p>
        </div>

        {/* Impact ladder */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {items.map(({ amount, icon, impact }) => (
            <div key={amount} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-5 text-center transition-colors cursor-default">
              <div className="text-4xl mb-3">{icon}</div>
              <div className="text-2xl font-extrabold text-accent mb-2">{amount}</div>
              <p className="text-sm text-primary-200 leading-snug">{impact}</p>
            </div>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <Link
            href={`/${lang}/colabora/`}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-700 text-white font-bold px-10 py-4 rounded-full text-xl transition-colors shadow-xl shadow-accent/30"
          >
            {t(lang, 'home.donationCTA.button')} →
          </Link>
          <p className="text-primary-300 text-sm mt-4">
            {bottomText}
          </p>
        </div>
      </div>
    </section>
  );
}
