import { Lang } from '@/lib/types';

interface Props {
  lang: Lang;
}

const quotes = {
  es: {
    text: 'Aunque reparta todos mis bienes a los pobres, (…) si no tengo Amor, de nada me aprovecha.',
    reference: '1ª Corintios 13, 3',
  },
  fr: {
    text: "Quand je distribuerais tous mes biens pour nourrir les pauvres, (…) si je n'ai pas la charité, cela ne me sert de rien.",
    reference: '1 Corinthiens 13, 3',
  },
};

export default function BibleQuote({ lang }: Props) {
  const { text, reference } = quotes[lang];

  return (
    <section className="bg-primary-900 py-14">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <span className="block text-primary-light text-4xl mb-6 opacity-40 font-serif leading-none">&ldquo;</span>
        <blockquote className="text-white text-xl sm:text-2xl font-light leading-relaxed italic mb-6">
          {text}
        </blockquote>
        <cite className="text-primary-light text-sm font-semibold tracking-widest uppercase not-italic">
          {reference}
        </cite>
      </div>
    </section>
  );
}
