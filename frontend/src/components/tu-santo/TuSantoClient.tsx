'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { saints, getSaintByEmail, getSaintById, type Santo } from '@/lib/saints';

const SITE_URL = 'https://fundacionluzdebenin.org';
const LS_KEY = 'santo-misionero-v1';

type Step = 'form' | 'animating' | 'result' | 'shared';

interface StoredData {
  email: string;
  nombre: string;
  santoId: number;
  fecha: string;
}

interface Props {
  lang: 'es' | 'fr';
}

const TX = {
  es: {
    badge: 'Fundación Luz de Benín · 2026',
    title: 'Tu Santo Misionero en África',
    subtitle:
      'Descubre qué santo te acompaña este año en nuestra misión en Benín. La Providencia ya lo ha elegido para ti.',
    nameLabel: 'Tu nombre (opcional)',
    namePlaceholder: 'María, Juan…',
    emailLabel: 'Tu email',
    emailPlaceholder: 'tu@email.com',
    checkboxTitle: 'Quiero recibir noticias de la misión',
    checkboxBody: 'Te contamos cómo van los orfanatos, los proyectos y cómo puedes ayudar. Sin spam, solo lo que importa.',
    checkboxLabel: 'Sí, quiero recibir noticias de la Fundación Luz de Benín',
    submitBtn: 'Descubrir mi Santo',
    submitting: 'Un momento…',
    emailRequired: 'El email es obligatorio',
    emailInvalid: 'Introduce un email válido',
    animatingLine1: 'La Providencia está eligiendo tu santo…',
    animatingLine2: 'En el silencio, escucha.',
    resultGreeting: (nombre: string) =>
      nombre ? `Tu santo este año, ${nombre}, es…` : 'Tu santo misionero es…',
    festividadLabel: 'Festividad',
    origenLabel: 'Origen',
    fechasLabel: 'Época',
    historiaLabel: 'Su historia',
    citaLabel: 'Su lema',
    conexionLabel: 'Conexión con la Fundación',
    shareWhatsapp: 'Compartir en WhatsApp',
    shareCopy: 'Copiar enlace',
    copied: '¡Copiado!',
    donateBtn: 'Hacer una donación',
    projectBtn: 'Conoce la misión',
    resetBtn: 'Descubrir otro año',
    sharedTitle: 'alguien ha compartido su santo contigo',
    sharedSubtitle:
      'Este es el santo que le acompaña este año en la misión de Benín. ¿Quieres descubrir el tuyo?',
    sharedCta: 'Descubrir el mío',
    shareText: (nombre: string, cita: string, _id: number) =>
      `✝️ Mi Santo Misionero en África este año es ${nombre}.\n\n"${cita}"\n\nDescubre el tuyo → ${SITE_URL}/tu-santo/`,
  },
  fr: {
    badge: 'Fondation Lumière du Bénin · 2026',
    title: 'Ton Saint Missionnaire en Afrique',
    subtitle:
      'Découvre quel saint t\'accompagne cette année dans notre mission au Bénin. La Providence l\'a déjà choisi pour toi.',
    nameLabel: 'Ton prénom (facultatif)',
    namePlaceholder: 'Marie, Jean…',
    emailLabel: 'Ton email',
    emailPlaceholder: 'ton@email.com',
    checkboxTitle: 'Je veux recevoir des nouvelles de la mission',
    checkboxBody: 'On te raconte comment avancent les orphelinats, les projets et comment tu peux aider. Sans spam, seulement ce qui compte.',
    checkboxLabel: "Oui, je veux recevoir les nouvelles de la Fondation",
    submitBtn: 'Découvrir mon Saint',
    submitting: 'Un moment…',
    emailRequired: "L'email est obligatoire",
    emailInvalid: 'Saisissez un email valide',
    animatingLine1: 'La Providence choisit ton saint…',
    animatingLine2: 'Dans le silence, écoute.',
    resultGreeting: (nombre: string) =>
      nombre ? `Ton saint cette année, ${nombre}, est…` : 'Ton saint missionnaire est…',
    festividadLabel: 'Fête',
    origenLabel: 'Origine',
    fechasLabel: 'Époque',
    historiaLabel: 'Son histoire',
    citaLabel: 'Sa devise',
    conexionLabel: 'Lien avec la Fondation',
    shareWhatsapp: 'Partager sur WhatsApp',
    shareCopy: 'Copier le lien',
    copied: 'Copié !',
    donateBtn: 'Faire un don',
    projectBtn: 'Découvrir la mission',
    resetBtn: 'Recommencer',
    sharedTitle: 'quelqu\'un a partagé son saint avec toi',
    sharedSubtitle:
      'C\'est le saint qui l\'accompagne cette année dans la mission au Bénin. Veux-tu découvrir le tien ?',
    sharedCta: 'Découvrir le mien',
    shareText: (nombre: string, cita: string, _id: number) =>
      `✝️ Mon Saint Missionnaire en Afrique cette année est ${nombre}.\n\n"${cita}"\n\nDécouvre le tien → ${SITE_URL}/tu-santo/`,
  },
};

function saveLead(data: {
  email: string;
  nombre: string;
  santo_id: number;
  santo_asignado: string;
  acepta_comunicaciones: boolean;
  lang: string;
}) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  fetch(`${apiUrl}/api/santo-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {/* fire-and-forget */});
}

export default function TuSantoClient({ lang }: Props) {
  const tx = TX[lang];
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('form');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [saint, setSaint] = useState<Santo | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);

  // On mount: check for ?santo param or localStorage
  useEffect(() => {
    const santoParam = searchParams.get('santo');
    if (santoParam) {
      const id = parseInt(santoParam, 10);
      const found = getSaintById(id);
      if (found) {
        setSaint(found);
        setIsShared(true);
        setStep('shared');
        return;
      }
    }
    // Check localStorage
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        const found = getSaintById(data.santoId);
        if (found) {
          setSaint(found);
          setNombre(data.nombre || '');
          setEmail(data.email || '');
          setStep('result');
        }
      }
    } catch {/* ignore */}
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setEmailError('');

      if (!email.trim()) {
        setEmailError(tx.emailRequired);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError(tx.emailInvalid);
        return;
      }

      const assignedSaint = getSaintByEmail(email);
      setSaint(assignedSaint);

      // Save lead (fire-and-forget)
      saveLead({
        email: email.trim(),
        nombre: nombre.trim(),
        santo_id: assignedSaint.id,
        santo_asignado: assignedSaint.nombre,
        acepta_comunicaciones: acepta,
        lang,
      });

      // Save to localStorage
      const stored: StoredData = {
        email: email.trim(),
        nombre: nombre.trim(),
        santoId: assignedSaint.id,
        fecha: new Date().toISOString(),
      };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(stored));
      } catch {/* ignore */}

      // Start animation
      setStep('animating');
      setAnimPhase(0);
      setTimeout(() => setAnimPhase(1), 800);
      setTimeout(() => setAnimPhase(2), 1800);
      setTimeout(() => {
        setIsShared(false);
        setStep('result');
      }, 3200);
    },
    [email, nombre, acepta, lang, tx]
  );

  const handleReset = () => {
    try { localStorage.removeItem(LS_KEY); } catch {/* ignore */}
    setSaint(null);
    setNombre('');
    setEmail('');
    setAcepta(false);
    setIsShared(false);
    setAnimPhase(0);
    setStep('form');
  };

  const shareText = saint
    ? tx.shareText(saint.nombre, saint.cita, saint.id)
    : '';
  const shareUrl = `${SITE_URL}/tu-santo/`;

  const handleWhatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {/* ignore */}
  };

  /* ── FORM ─────────────────────────────────────────────── */
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col">
        {/* Animation keyframes */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 30px 8px rgba(251,191,36,0.15); }
            50% { box-shadow: 0 0 60px 20px rgba(251,191,36,0.30); }
          }
          .candle-float { animation: float 3s ease-in-out infinite; }
          .gold-glow { animation: glow-pulse 3s ease-in-out infinite; }
        `}</style>

        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-6">
            {tx.badge}
          </span>

          {/* Candle */}
          <div className="candle-float gold-glow w-24 h-24 rounded-full flex items-center justify-center mb-8">
            <span className="text-7xl select-none">🕯️</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight max-w-2xl">
            {tx.title}
          </h1>
          <p className="text-stone-400 text-base sm:text-lg max-w-md leading-relaxed mb-12">
            {tx.subtitle}
          </p>

          {/* Form card */}
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 text-left shadow-2xl">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">
                  {tx.nameLabel}
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={tx.namePlaceholder}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1.5">
                  {tx.emailLabel} <span className="text-amber-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder={tx.emailPlaceholder}
                  className={`w-full bg-stone-800 border rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition ${
                    emailError ? 'border-red-500' : 'border-stone-700'
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-400">{emailError}</p>
                )}
              </div>

              {/* Newsletter card */}
              <label
                className={`block cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  acepta
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-stone-700 bg-stone-800/50 hover:border-stone-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <span className="text-2xl shrink-0 mt-0.5">📩</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold mb-1 transition-colors ${acepta ? 'text-amber-400' : 'text-stone-200'}`}>
                      {tx.checkboxTitle}
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {tx.checkboxBody}
                    </p>
                  </div>
                  {/* Checkmark */}
                  <div className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-0.5 ${
                    acepta ? 'bg-amber-500 border-amber-500' : 'border-stone-600'
                  }`}>
                    {acepta && (
                      <svg className="w-3 h-3 text-stone-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                {acepta && (
                  <p className="text-xs text-amber-500/80 mt-2 ml-9">
                    {tx.checkboxLabel}
                  </p>
                )}
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-4 rounded-xl transition-all duration-200 text-base shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 hover:scale-[1.01] active:scale-[0.99]"
              >
                ✝ {tx.submitBtn}
              </button>
            </form>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-stone-600">
            <span>8 santos misioneros</span>
            <span>·</span>
            <span>Asignación providencial</span>
            <span>·</span>
            <span>Sin spam</span>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="text-center pb-8">
          <div className="flex justify-center gap-1 mb-2">
            {saints.map((s) => (
              <div
                key={s.id}
                className="w-1 h-1 rounded-full opacity-40"
                style={{ backgroundColor: s.color_acento }}
              />
            ))}
          </div>
          <p className="text-xs text-stone-700">fundacionluzdebenin.org</p>
        </div>
      </div>
    );
  }

  /* ── ANIMATING ────────────────────────────────────────── */
  if (step === 'animating') {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4">
        <style>{`
          @keyframes flicker {
            0%, 100% { opacity: 1; transform: scale(1) rotate(-1deg); }
            20% { opacity: 0.85; transform: scale(0.97) rotate(1deg); }
            40% { opacity: 1; transform: scale(1.03) rotate(-0.5deg); }
            60% { opacity: 0.9; transform: scale(0.98) rotate(0.5deg); }
            80% { opacity: 1; transform: scale(1.01) rotate(-1deg); }
          }
          @keyframes ring-expand {
            0% { transform: scale(0.6); opacity: 0.8; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes fade-up {
            0% { opacity: 0; transform: translateY(12px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .flicker { animation: flicker 0.8s ease-in-out infinite; }
          .ring-1 { animation: ring-expand 2.4s ease-out infinite; }
          .ring-2 { animation: ring-expand 2.4s ease-out 0.8s infinite; }
          .ring-3 { animation: ring-expand 2.4s ease-out 1.6s infinite; }
          .fade-up-1 { animation: fade-up 0.7s ease forwards; animation-delay: 0.3s; opacity: 0; }
          .fade-up-2 { animation: fade-up 0.7s ease forwards; animation-delay: 1.2s; opacity: 0; }
        `}</style>

        {/* Concentric rings */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="ring-1 absolute w-32 h-32 rounded-full border border-amber-500/30" />
          <div className="ring-2 absolute w-32 h-32 rounded-full border border-amber-400/20" />
          <div className="ring-3 absolute w-32 h-32 rounded-full border border-amber-300/10" />
          <span className="flicker text-8xl relative z-10 select-none">🕯️</span>
        </div>

        <p className={`fade-up-1 text-white text-xl sm:text-2xl font-light text-center max-w-xs leading-relaxed`}>
          {tx.animatingLine1}
        </p>
        <p className="fade-up-2 text-stone-500 text-sm text-center mt-3 italic">
          {tx.animatingLine2}
        </p>
      </div>
    );
  }

  /* ── SHARED (viewed via ?santo=ID) ───────────────────── */
  if (step === 'shared' && saint) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        {/* Shared header */}
        <div className="bg-stone-950 text-center py-6 px-4">
          <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-1">
            {tx.badge}
          </p>
          <p className="text-stone-300 text-sm">{tx.sharedTitle}</p>
        </div>

        {/* Saint card (shared view) */}
        <div className="flex-1 flex flex-col items-center py-10 px-4">
          <SaintCard saint={saint} nombre="" tx={tx} lang={lang} isShared />

          {/* Discover yours CTA */}
          <div className="mt-8 w-full max-w-lg bg-stone-950 rounded-2xl p-6 text-center">
            <p className="text-stone-300 text-sm leading-relaxed mb-4">
              {tx.sharedSubtitle}
            </p>
            <button
              onClick={handleReset}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 px-8 rounded-xl transition-all text-base"
            >
              ✝ {tx.sharedCta}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULT ───────────────────────────────────────────── */
  if (step === 'result' && saint) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        {/* Top bar */}
        <div className="bg-stone-950 text-center py-4 px-4">
          <p className="text-stone-400 text-xs">{tx.badge}</p>
        </div>

        <div className="flex-1 flex flex-col items-center py-10 px-4">
          {/* Greeting */}
          <p className="text-stone-500 text-sm mb-2 text-center">
            {tx.resultGreeting(nombre)}
          </p>

          <SaintCard saint={saint} nombre={nombre} tx={tx} lang={lang} isShared={false} />

          {/* Actions */}
          <div className="w-full max-w-lg mt-6 space-y-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsapp}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20"
            >
              <WhatsAppIcon />
              {tx.shareWhatsapp}
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold py-3.5 rounded-xl border border-stone-200 transition-all"
            >
              {copied ? (
                <>✓ {tx.copied}</>
              ) : (
                <>{tx.shareCopy}</>
              )}
            </button>

            {/* Donate */}
            <Link
              href={`/${lang}/colabora/`}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-900/20"
            >
              ❤ {tx.donateBtn}
            </Link>

            {/* Mission */}
            <Link
              href={`/${lang}/que-hacemos/`}
              className="w-full flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-semibold py-3.5 rounded-xl transition-all"
            >
              {tx.projectBtn} →
            </Link>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full text-center text-xs text-stone-400 hover:text-stone-600 py-2 transition-colors"
            >
              {tx.resetBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ── Saint Card component ──────────────────────────────── */
interface SaintCardProps {
  saint: Santo;
  nombre: string;
  tx: typeof TX['es'];
  lang: string;
  isShared: boolean;
}

function SaintCard({ saint, tx }: SaintCardProps) {
  return (
    <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-xl">
      {/* Accent top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: saint.color_acento }} />

      <div className="p-6 sm:p-8">
        {/* Opening quote */}
        <blockquote className="text-lg sm:text-xl italic text-stone-600 leading-relaxed mb-6 text-center">
          <span className="text-4xl leading-none" style={{ color: saint.color_acento }}>&ldquo;</span>
          <span className="block mt-1">{saint.cita}</span>
          <span className="text-4xl leading-none" style={{ color: saint.color_acento }}>&rdquo;</span>
        </blockquote>

        {/* Divider */}
        <div className="border-t border-stone-100 mb-6" />

        {/* Saint name */}
        <div className="text-center mb-6">
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 text-white"
            style={{ backgroundColor: saint.color_acento }}
          >
            {saint.etiqueta}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {saint.nombre}
          </h2>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MetaItem label={tx.origenLabel} value={saint.origen} />
          <MetaItem label={tx.fechasLabel} value={saint.fechas} />
          <MetaItem label={tx.festividadLabel} value={saint.festividad} />
        </div>

        {/* Historia */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
            {tx.historiaLabel}
          </p>
          <p className="text-stone-700 text-sm leading-relaxed">{saint.historia}</p>
        </div>

        {/* Conexión fundación */}
        <div
          className="rounded-xl p-4 border-l-4"
          style={{
            backgroundColor: `${saint.color_acento}12`,
            borderLeftColor: saint.color_acento,
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: saint.color_acento }}>
            {tx.conexionLabel}
          </p>
          <p className="text-stone-700 text-sm leading-relaxed">
            {saint.conexion_fundacion}
          </p>
        </div>
      </div>

      {/* Bottom dots */}
      <div className="bg-stone-50 border-t border-stone-100 py-3 px-6 flex items-center justify-between">
        <span className="text-xs text-stone-400">fundacionluzdebenin.org</span>
        <span className="text-lg">✝️</span>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 rounded-xl p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-0.5">{label}</p>
      <p className="text-xs text-stone-700 font-medium leading-tight">{value}</p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
