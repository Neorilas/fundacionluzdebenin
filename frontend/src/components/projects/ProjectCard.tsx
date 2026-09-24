import Link from 'next/link';
import Image from 'next/image';
import { Lang, Project, parseProjectImage } from '@/lib/types';
import { t } from '@/lib/i18n';
import Badge from '../ui/Badge';

interface Props {
  project: Project;
  lang: Lang;
  /** h2 on listing pages without section headings, h3 inside a titled section (home). */
  headingLevel?: 'h2' | 'h3';
}

export default function ProjectCard({ project, lang, headingLevel = 'h3' }: Props) {
  const Heading = headingLevel;
  const title = (lang === 'fr' && project.titleFr) || project.titleEs;
  const desc = (lang === 'fr' && project.descFr) || project.descEs;
  const statusLabel = t(lang, `projects.status.${project.status}`);

  return (
    <Link href={`/${lang}/proyectos/${project.slug}/`} className="block group">
      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
        {/* Image */}
        <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden shrink-0">
          {project.images?.[0] ? (() => {
            const img = parseProjectImage(project.images[0]);
            return (
              <Image
                src={img.url}
                alt={img.alt || title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            );
          })() : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl">🏗️</div>
          )}
          {project.featured && (
            <div className="absolute top-3 right-3 bg-orange-700 text-white text-xs font-bold px-2 py-1 rounded-full">
              ⭐ {lang === 'es' ? 'Destacado' : 'En vedette'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-2">
            <Badge status={project.status} label={statusLabel} />
          </div>
          <Heading className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{title}</Heading>
          <p className="text-sm text-muted line-clamp-3 mb-4 flex-1">{desc}</p>

          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-800 group-hover:text-accent transition-colors">
            {t(lang, 'projects.readMore')} →
          </span>
        </div>
      </article>
    </Link>
  );
}
