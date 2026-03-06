'use client';

import { useState } from 'react';
import { Lang, StripeProduct } from '@/lib/types';
import { api } from '@/lib/api';

interface Props {
  lang: Lang;
  stripeProducts: StripeProduct[];
}

const MONTHLY_PRESETS = [5, 10, 20, 50];
const ONE_TIME_PRESETS = [10, 25, 50, 100];

const L = {
  es: {
    recommended: 'RECOMENDADO',
    title: 'Hazte socio/a mensual',
    subtitle: 'Tu cuota mensual nos permite planificar y mantener proyectos a largo plazo. Es la forma más valiosa de ayudar.',
    monthlyImpact: '💚 Con 10€/mes educamos a un niño durante todo un año.',
    customPlaceholder: 'Otra cantidad (€/mes)',
    oneTimeTitle: 'O haz una donación única',
    oneTimeCustom: 'Otra cantidad (€)',
    donorName: 'Nombre (opcional)',
    donorEmail: 'Email (opcional, para recibo)',
    donorDni: 'DNI/NIF (para certificado fiscal anual)',
    btnMonthly: 'Suscribirme',
    btnOneTime: 'Donar',
    perMonth: '€/mes',
    loading: 'Redirigiendo a Stripe...',
    errorMin: 'El importe mínimo es 1€',
    errorGeneric: 'Error al procesar. Inténtalo de nuevo.',
    fiscalNote: 'Deducible hasta el 80% en la declaración de la renta (Ley 49/2002)',
    selectPlan: 'O elige un plan:',
    customMonthly: 'Elige tu importe',
  },
  fr: {
    recommended: 'RECOMMANDÉ',
    title: 'Devenez membre mensuel',
    subtitle: 'Votre cotisation mensuelle nous permet de planifier et maintenir des projets à long terme. C\'est la façon la plus précieuse d\'aider.',
    monthlyImpact: '💚 Avec 10€/mois, nous éduquons un enfant pendant toute une année.',
    customPlaceholder: 'Autre montant (€/mois)',
    oneTimeTitle: 'Ou faites un don unique',
    oneTimeCustom: 'Autre montant (€)',
    donorName: 'Nom (optionnel)',
    donorEmail: 'Email (optionnel, pour reçu)',
    donorDni: 'NIE/NIF (pour certificat fiscal annuel)',
    btnMonthly: 'M\'abonner',
    btnOneTime: 'Donner',
    perMonth: '€/mois',
    loading: 'Redirection vers Stripe...',
    errorMin: 'Le montant minimum est 1€',
    errorGeneric: 'Erreur lors du traitement. Veuillez réessayer.',
    fiscalNote: 'Déductible jusqu\'à 80% sur la déclaration de revenus',
    selectPlan: 'Ou choisissez un plan :',
    customMonthly: 'Choisissez votre montant',
  },
};

export default function DonationWidget({ lang, stripeProducts }: Props) {
  const t = L[lang] ?? L.es;
  const hasProducts = stripeProducts.length > 0;

  // Monthly state
  const [monthlyPreset, setMonthlyPreset] = useState(10);
  const [monthlyCustom, setMonthlyCustom] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(stripeProducts[0]?.id ?? '');
  // When there ARE products, user can toggle to "pick your own amount" mode
  const [useCustomMonthly, setUseCustomMonthly] = useState(!hasProducts);

  // One-time state (collapsed by default)
  const [showOneTime, setShowOneTime] = useState(false);
  const [oneTimePreset, setOneTimePreset] = useState(25);
  const [oneTimeCustom, setOneTimeCustom] = useState('');

  // Donor data (shared)
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorDni, setDonorDni] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getMonthlyAmount = () =>
    monthlyCustom ? Math.round(parseFloat(monthlyCustom) * 100) : monthlyPreset * 100;

  const getOneTimeAmount = () =>
    oneTimeCustom ? Math.round(parseFloat(oneTimeCustom) * 100) : oneTimePreset * 100;

  const donorData = {
    donorName: donorName || undefined,
    donorEmail: donorEmail || undefined,
    donorDni: donorDni || undefined,
  };

  const handleMonthly = async () => {
    setError('');
    if (hasProducts && !useCustomMonthly) {
      if (!selectedProduct) { setError(t.errorMin); return; }
      setLoading(true);
      try {
        const r = await api.createCheckout({ type: 'subscription', stripeProductId: selectedProduct, lang, ...donorData });
        if (r.error) throw new Error(r.error);
        window.location.href = r.url;
      } catch { setError(t.errorGeneric); setLoading(false); }
    } else {
      const amount = getMonthlyAmount();
      if (!amount || amount < 100) { setError(t.errorMin); return; }
      setLoading(true);
      try {
        const r = await api.createCheckout({ type: 'subscription', amount, lang, ...donorData });
        if (r.error) throw new Error(r.error);
        window.location.href = r.url;
      } catch { setError(t.errorGeneric); setLoading(false); }
    }
  };

  const handleOneTime = async () => {
    setError('');
    const amount = getOneTimeAmount();
    if (!amount || amount < 100) { setError(t.errorMin); return; }
    setLoading(true);
    try {
      const r = await api.createCheckout({ type: 'one_time', amount, lang, ...donorData });
      if (r.error) throw new Error(r.error);
      window.location.href = r.url;
    } catch { setError(t.errorGeneric); setLoading(false); }
  };

  const monthlyButtonLabel = () => {
    if (loading) return t.loading;
    if (hasProducts && !useCustomMonthly) {
      const p = stripeProducts.find(p => p.id === selectedProduct);
      const euros = p ? (p.amount / 100).toFixed(0) : '?';
      return `${t.btnMonthly} ${euros}${t.perMonth} →`;
    }
    const euros = monthlyCustom ? parseFloat(monthlyCustom) || 0 : monthlyPreset;
    return `${t.btnMonthly} ${euros}${t.perMonth} →`;
  };

  const oneTimeButtonLabel = () => {
    if (loading) return t.loading;
    const euros = oneTimeCustom ? parseFloat(oneTimeCustom) || 0 : oneTimePreset;
    return `${t.btnOneTime} ${euros}€ →`;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-primary-900 to-primary-800">
      <div className="max-w-xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-100 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-accent/30">
            ⭐ {t.recommended}
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">{t.title}</h2>
          <p className="text-primary-200 text-sm leading-relaxed max-w-md mx-auto">{t.subtitle}</p>
        </div>

        {/* Main card — MONTHLY */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">

          {/* Orange header stripe */}
          <div className="bg-accent px-6 py-3">
            <p className="text-white text-sm font-semibold">{t.monthlyImpact}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Amount selection */}
            {hasProducts && !useCustomMonthly ? (
              /* Named product cards */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stripeProducts.map(product => {
                    const name = lang === 'es' ? product.nameEs : product.nameFr;
                    const desc = lang === 'es' ? product.descEs : product.descFr;
                    const euros = (product.amount / 100).toFixed(0);
                    const interval = product.interval === 'year' ? '€/año' : t.perMonth;
                    const isSelected = selectedProduct === product.id;
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-accent bg-orange-50 shadow-sm'
                            : 'border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        <div className="text-2xl font-extrabold text-gray-900">{euros}{interval}</div>
                        <div className="text-sm font-semibold text-gray-700 mt-0.5">{name}</div>
                        {desc && <div className="text-xs text-gray-500 mt-1">{desc}</div>}
                        {isSelected && <div className="mt-2 text-xs font-bold text-accent">✓ Seleccionado</div>}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setUseCustomMonthly(true)}
                  className="w-full text-center text-sm text-gray-400 hover:text-accent py-2 border border-dashed border-gray-200 rounded-xl hover:border-orange-300 transition-colors"
                >
                  {t.customMonthly} →
                </button>
              </div>
            ) : (
              /* Preset + custom amount */
              <div className="space-y-3">
                {hasProducts && (
                  <button
                    onClick={() => { setUseCustomMonthly(false); setMonthlyCustom(''); }}
                    className="text-sm text-primary-700 hover:text-primary-900 font-medium"
                  >
                    ← {t.selectPlan}
                  </button>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {MONTHLY_PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => { setMonthlyPreset(p); setMonthlyCustom(''); }}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        monthlyPreset === p && !monthlyCustom
                          ? 'border-accent bg-accent text-white shadow-sm'
                          : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {p}€
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={monthlyCustom}
                  onChange={e => { setMonthlyCustom(e.target.value); setMonthlyPreset(0); }}
                  placeholder={t.customPlaceholder}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            )}

            {/* Donor data */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                placeholder={t.donorName}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="email"
                value={donorEmail}
                onChange={e => setDonorEmail(e.target.value)}
                placeholder={t.donorEmail}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                value={donorDni}
                onChange={e => setDonorDni(e.target.value)}
                placeholder={t.donorDni}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Submit monthly */}
            <button
              onClick={handleMonthly}
              disabled={loading}
              className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            >
              {monthlyButtonLabel()}
            </button>

            {/* Fiscal note */}
            <p className="text-xs text-gray-400 text-center">🧾 {t.fiscalNote}</p>

            {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
          </div>
        </div>

        {/* One-time donation — secondary, collapsible */}
        <div className="bg-white/10 rounded-xl border border-white/20 overflow-hidden">
          <button
            onClick={() => setShowOneTime(v => !v)}
            className="w-full px-5 py-4 text-left text-white/80 hover:text-white text-sm font-medium flex items-center justify-between transition-colors"
          >
            <span>{t.oneTimeTitle}</span>
            <span className="text-lg">{showOneTime ? '▲' : '▼'}</span>
          </button>

          {showOneTime && (
            <div className="px-5 pb-5 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {ONE_TIME_PRESETS.map(p => (
                  <button
                    key={p}
                    onClick={() => { setOneTimePreset(p); setOneTimeCustom(''); }}
                    className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${
                      oneTimePreset === p && !oneTimeCustom
                        ? 'border-white bg-white text-primary-800'
                        : 'border-white/30 text-white hover:bg-white/10'
                    }`}
                  >
                    {p}€
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                step="1"
                value={oneTimeCustom}
                onChange={e => { setOneTimeCustom(e.target.value); setOneTimePreset(0); }}
                placeholder={t.oneTimeCustom}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <div className="space-y-2 pt-1 border-t border-white/20">
                <input
                  type="text"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder={t.donorName}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="email"
                  value={donorEmail}
                  onChange={e => setDonorEmail(e.target.value)}
                  placeholder={t.donorEmail}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="text"
                  value={donorDni}
                  onChange={e => setDonorDni(e.target.value)}
                  placeholder={t.donorDni}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                onClick={handleOneTime}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 text-primary-800 font-bold py-3 px-6 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {oneTimeButtonLabel()}
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
