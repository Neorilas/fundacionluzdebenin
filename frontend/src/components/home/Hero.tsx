import Link from 'next/link';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
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
  es: 'Una fundación movida por el Amor en Benín, África Occidental.',
  fr: 'Une fondation animée par l\'Amour au Bénin, Afrique de l\'Ouest.',
};

export default function Hero({ lang }: Props) {
  const { text, reference } = quotes[lang];

  return (
    <section className="relative bg-primary-900 text-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">

        {/* Bible quote — eje central */}
        <div className="mb-12">
          <span className="block text-primary-light text-7xl font-serif leading-none opacity-30 mb-4">&ldquo;</span>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light italic leading-relaxed text-white mb-6">
            {text}
          </blockquote>
          <cite className="inline-block text-primary-light text-sm sm:text-base font-semibold tracking-widest uppercase not-italic border-t border-primary-700 pt-4">
            {reference}
          </cite>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 bg-primary-700" />
          <span className="text-primary-400 text-xl">✦</span>
          <div className="h-px w-16 bg-primary-700" />
        </div>

        {/* Tagline */}
        <p className="text-primary-200 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          {taglines[lang]}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/${lang}/proyectos/`}
            className="inline-flex items-center gap-2 bg-white text-primary-900 hover:bg-primary-50 font-semibold px-7 py-3 rounded-full transition-colors"
          >
            {lang === 'es' ? 'Conoce nuestros proyectos' : 'Découvrez nos projets'} →
          </Link>
          <Link
            href={`/${lang}/colabora/`}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-700 text-white font-semibold px-7 py-3 rounded-full transition-colors"
          >
            {t(lang, 'common.donate')} 💚
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
