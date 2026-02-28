'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lang } from '@/lib/types';

interface Props {
  lang: Lang;
}

export default function LangSwitcher({ lang }: Props) {
  const pathname = usePathname();

  const otherLang: Lang = lang === 'es' ? 'fr' : 'es';
  const otherPath = pathname.replace(`/${lang}`, `/${otherLang}`);

  return (
    <Link
      href={otherPath}
      className="flex items-center gap-1 px-2 py-1 rounded border border-primary-600 text-primary-100 hover:bg-primary-700 text-xs font-medium transition-colors"
      title={otherLang === 'fr' ? 'Passer en français' : 'Cambiar a español'}
    >
      {otherLang === 'fr' ? '🇫🇷 FR' : '🇪🇸 ES'}
    </Link>
  );
}
