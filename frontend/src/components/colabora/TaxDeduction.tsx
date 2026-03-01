import { Lang } from '@/lib/types';

interface Props {
  lang: Lang;
}

const content = {
  es: {
    badge: 'Donantes en España',
    title: 'Desgrava tu donación',
    subtitle: 'Las donaciones a fundaciones acogidas a la Ley 49/2002 de Régimen Fiscal del Mecenazgo son deducibles en tu declaración de la Renta.',
    rates: [
      {
        pct: '80%',
        range: 'Primeros 250 €',
        desc: 'El primer tramo de tu donación tiene la deducción más alta',
        highlight: true,
      },
      {
        pct: '35%',
        range: 'Resto de la donación',
        desc: 'Sobre la cantidad que supere los 250 €',
        highlight: false,
      },
    ],
    bonus: '¿Donas todos los años? Si llevas 3 o más años donando a la misma entidad, el 35% sube al 40% en el tramo que supere los 250 €.',
    examplesTitle: 'Calcula tu ahorro real',
    examples: [
      {
        donation: 50,
        deduction: 40,
        cost: 10,
        label: 'Donación pequeña',
        pctSaved: '80%',
      },
      {
        donation: 100,
        deduction: 80,
        cost: 20,
        label: 'Donación habitual',
        pctSaved: '80%',
      },
      {
        donation: 500,
        deduction: 288,
        cost: 212,
        label: 'Gran donación',
        pctSaved: '57%',
      },
    ],
    donationLabel: 'Donas',
    deductionLabel: 'Deduces',
    costLabel: 'Coste real',
    legal: 'Beneficio fiscal según Ley 49/2002, art. 19. Los porcentajes aplican sobre cuota íntegra. Consulta con tu asesor fiscal.',
  },
  fr: {
    badge: 'Donateurs résidant en Espagne',
    title: 'Déduction fiscale en Espagne',
    subtitle: 'Si vous résidez fiscalement en Espagne, vos dons à des fondations reconnues sous la Loi 49/2002 de mécénat sont déductibles de votre impôt sur le revenu.',
    rates: [
      {
        pct: '80%',
        range: 'Premiers 250 €',
        desc: 'La première tranche bénéficie du taux de déduction le plus élevé',
        highlight: true,
      },
      {
        pct: '35%',
        range: 'Au-delà de 250 €',
        desc: 'Sur la partie du don qui dépasse 250 €',
        highlight: false,
      },
    ],
    bonus: 'Vous donnez chaque année ? Si vous avez donné à la même organisation 3 années consécutives ou plus, le taux de 35% monte à 40% pour la tranche au-delà de 250 €.',
    examplesTitle: 'Calculez votre économie réelle',
    examples: [
      {
        donation: 50,
        deduction: 40,
        cost: 10,
        label: 'Petit don',
        pctSaved: '80%',
      },
      {
        donation: 100,
        deduction: 80,
        cost: 20,
        label: 'Don habituel',
        pctSaved: '80%',
      },
      {
        donation: 500,
        deduction: 288,
        cost: 212,
        label: 'Grand don',
        pctSaved: '57%',
      },
    ],
    donationLabel: 'Vous donnez',
    deductionLabel: 'Vous déduisez',
    costLabel: 'Coût réel',
    legal: 'Avantage fiscal selon la Loi espagnole 49/2002, art. 19. Consultez votre conseiller fiscal.',
  },
};

export default function TaxDeduction({ lang }: Props) {
  const c = content[lang];

  return (
    <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-primary-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            🇪🇸 {c.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            💡 {c.title}
          </h2>
          <p className="text-primary-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {c.subtitle}
          </p>
        </div>

        {/* Rate cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {c.rates.map((rate) => (
            <div
              key={rate.pct}
              className={`rounded-2xl p-6 text-center border ${
                rate.highlight
                  ? 'bg-accent border-accent/50 shadow-lg shadow-accent/30'
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <div className={`text-6xl font-extrabold mb-1 ${rate.highlight ? 'text-white' : 'text-primary-100'}`}>
                {rate.pct}
              </div>
              <div className={`text-lg font-bold mb-2 ${rate.highlight ? 'text-white' : 'text-white'}`}>
                {rate.range}
              </div>
              <p className={`text-sm ${rate.highlight ? 'text-orange-100' : 'text-primary-300'}`}>
                {rate.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bonus note */}
        <div className="flex items-start gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-4 mb-10 text-sm text-primary-200">
          <span className="text-xl shrink-0">🎁</span>
          <p>{c.bonus}</p>
        </div>

        {/* Examples */}
        <h3 className="text-center text-lg font-bold text-primary-100 mb-5">{c.examplesTitle}</h3>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {c.examples.map((ex) => (
            <div key={ex.donation} className="bg-white rounded-2xl p-5 text-gray-900 shadow-lg">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{ex.label}</div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{c.donationLabel}</span>
                  <span className="font-bold text-gray-800">{ex.donation} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 font-medium">{c.deductionLabel}</span>
                  <span className="font-bold text-green-600">−{ex.deduction} €</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">{c.costLabel}</span>
                  <span className="text-xl font-extrabold text-primary-800">{ex.cost} €</span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl py-2 text-center">
                <span className="text-xs text-primary-700 font-semibold">
                  Ahorras el {ex.pctSaved} ✓
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Legal footnote */}
        <p className="text-center text-xs text-primary-400 max-w-2xl mx-auto">
          {c.legal}
        </p>

      </div>
    </section>
  );
}
