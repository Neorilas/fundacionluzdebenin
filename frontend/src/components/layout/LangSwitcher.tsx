'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lang } from '@/lib/types';

interface Props {
  lang: Lang;
}

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
];

export default function LangSwitcher({ lang }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex items-center rounded-lg border border-primary-600 overflow-hidden">
      {LANGS.map(({ code, flag, label }) => {
        const targetPath = pathname.replace(`/${lang}`, `/${code}`);
        const isActive = lang === code;

        if (isActive) {
          return (
            <span
              key={code}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-700 text-white text-xs font-semibold select-none"
            >
              <span className="text-base leading-none">{flag}</span>
              <span>{label}</span>
            </span>
          );
        }

        return (
          <Link
            key={code}
            href={targetPath}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-primary-200 hover:bg-primary-700 hover:text-white text-xs font-medium transition-colors"
            title={code === 'fr' ? 'Passer en français' : 'Cambiar a español'}
          >
            <span className="text-base leading-none">{flag}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
