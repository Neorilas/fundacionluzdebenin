import Link from 'next/link';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
}

export default function DonationCTA({ lang }: Props) {
  return (
    <section className="py-20 bg-gradient-to-br from-accent-600 to-accent-700 text-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-6xl mb-6">💚</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          {t(lang, 'home.donationCTA.title')}
        </h2>
        <p className="text-lg text-orange-100 mb-8 leading-relaxed">
          {t(lang, 'home.donationCTA.subtitle')}
        </p>
        <Link
          href={`/${lang}/colabora/`}
          className="inline-flex items-center gap-2 bg-white text-accent font-bold px-8 py-4 rounded-full text-lg hover:bg-orange-50 transition-colors shadow-lg"
        >
          {t(lang, 'home.donationCTA.button')} →
        </Link>
      </div>
    </section>
  );
}
