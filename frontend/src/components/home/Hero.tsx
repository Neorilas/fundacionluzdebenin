import Image from 'next/image';
import Link from 'next/link';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
  sec?: any;
}

const quotes = {
  es: {
    text: 'Aunque reparta todos mis bienes a los pobres, (…) si no tengo Amor, de nada me aprovecha.',
    reference: '1ª Corintios 13, 3',
  },
  fr: {
    text: 'Quand je distribuerais tous mes biens pour nourrir les pauvres, (…) si je n\'ai pas la charité, cela ne me sert de rien.',
    reference: '1 Corinthiens 13, 3',
  },
};

const taglines = {
  es: 'Llevamos esperanza a los más vulnerables de Benín, África Occidental.',
  fr: "Nous apportons l'espoir aux plus vulnérables du Bénin, Afrique de l'Ouest.",
};

const heroStats = {
  es: [
    { value: '4', label: 'orfanatos' },
    { value: '2.500', label: 'gallinas' },
    { value: '+300k', label: 'huevos/año' },
  ],
  fr: [
    { value: '4', label: 'orphelinats' },
    { value: '2 500', label: 'poules' },
    { value: '+300k', label: 'œufs/an' },
  ],
};

export default function Hero({ lang, sec }: Props) {
  const text = sec?.hero?.quote?.[lang] || quotes[lang].text;
  const reference = sec?.hero?.quoteRef?.[lang] || quotes[lang].reference;
  const tagline = sec?.hero?.tagline?.[lang] || taglines[lang];
  const quickStats = [
    {
      value: sec?.hero?.stat1Value?.[lang] || heroStats[lang][0].value,
      label: sec?.hero?.stat1Label?.[lang] || heroStats[lang][0].label,
    },
    {
      value: sec?.hero?.stat2Value?.[lang] || heroStats[lang][1].value,
      label: sec?.hero?.stat2Label?.[lang] || heroStats[lang][1].label,
    },
    {
      value: sec?.hero?.stat3Value?.[lang] || heroStats[lang][2].value,
      label: sec?.hero?.stat3Label?.[lang] || heroStats[lang][2].label,
    },
  ];

  return (
    <section className="relative bg-primary-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-2xl px-8 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
            <Image
              src="/logo.jpg"
              alt="Fundación Luz de Benín"
              width={800}
              height={533}
              className="h-24 w-auto block"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Bible quote */}
        <div className="mb-10">
          <span className="block text-primary-light text-7xl font-serif leading-none opacity-30 mb-4">&ldquo;</span>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light italic leading-relaxed text-white mb-6">
            {text}
          </blockquote>
          <cite className="inline-block text-primary-light text-sm sm:text-base font-semibold tracking-widest uppercase not-italic border-t border-primary-700 pt-4">
            {reference}
          </cite>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-primary-700" />
          <span className="text-primary-400 text-xl">✦</span>
          <div className="h-px w-16 bg-primary-700" />
        </div>

        {/* Tagline */}
        <p className="text-primary-200 text-lg sm:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
          {tagline}
        </p>

        {/* Quick stats strip */}
        <div className="flex justify-center gap-8 sm:gap-12 mb-10">
          {quickStats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-white">{value}</div>
              <div className="text-xs text-primary-300 uppercase tracking-wide mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/${lang}/proyectos/`}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3 rounded-full transition-colors"
          >
            {lang === 'es' ? 'Ver proyectos' : 'Voir les projets'}
          </Link>
          <Link
            href={`/${lang}/colabora/`}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-700 text-white font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-accent/30 text-lg"
          >
            {t(lang, 'common.donate')} ❤️
          </Link>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 40L1440 40L1440 20C1200 0 960 40 720 20C480 0 240 40 0 20L0 40Z" fill="#FAFAFA" />
        </svg>
      </div>
    </section>
  );
}
