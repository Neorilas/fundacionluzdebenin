import Link from 'next/link';
import { Lang, Project } from '@/lib/types';
import { t } from '@/lib/i18n';
import Badge from '../ui/Badge';

interface Props {
  project: Project;
  lang: Lang;
}

export default function ProjectCard({ project, lang }: Props) {
  const title = lang === 'es' ? project.titleEs : project.titleFr;
  const desc = lang === 'es' ? project.descEs : project.descFr;
  const statusLabel = t(lang, `projects.status.${project.status}`);

  const goal = project.stats?.goal ? Number(project.stats.goal) : null;
  const raised = project.stats?.raised ? Number(project.stats.raised) : null;
  const pct = goal && raised ? Math.min(100, Math.round((raised / goal) * 100)) : null;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden shrink-0">
        {project.images?.[0] ? (
          <img
            src={project.images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">🏗️</div>
        )}
        {project.featured && (
          <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
            ⭐ {lang === 'es' ? 'Destacado' : 'En vedette'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <Badge status={project.status} label={statusLabel} />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted line-clamp-3 mb-4 flex-1">{desc}</p>

        {/* Progress bar */}
        {pct !== null && raised !== null && goal !== null && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-primary-800">
                {raised.toLocaleString(lang === 'es' ? 'es-ES' : 'fr-FR')}€{' '}
                <span className="text-muted font-normal">
                  {lang === 'es' ? 'recaudados' : 'collectés'}
                </span>
              </span>
              <span className="text-accent font-bold">{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-accent h-2.5 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-1.5">
              {lang === 'es' ? 'Objetivo:' : 'Objectif :'}{' '}
              <span className="font-semibold text-gray-700">
                {goal.toLocaleString(lang === 'es' ? 'es-ES' : 'fr-FR')}€
              </span>
            </p>
          </div>
        )}

        <Link
          href={`/${lang}/proyectos/${project.slug}/`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-800 hover:text-accent transition-colors"
        >
          {t(lang, 'projects.readMore')} →
        </Link>
      </div>
    </article>
  );
}
