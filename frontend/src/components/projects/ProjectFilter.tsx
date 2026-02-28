'use client';

import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
  active: string;
  onChange: (filter: string) => void;
}

const FILTERS = ['all', 'active', 'completed', 'planned'] as const;

export default function ProjectFilter({ lang, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === f
              ? 'bg-primary-800 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-800 hover:text-primary-800'
          }`}
        >
          {t(lang, `projects.filter.${f}`)}
        </button>
      ))}
    </div>
  );
}
