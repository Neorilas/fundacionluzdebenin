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

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
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
      <div className="p-5">
        <div className="mb-2">
          <Badge status={project.status} label={statusLabel} />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted line-clamp-3 mb-4">{desc}</p>

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
