import Link from 'next/link';
import { Lang, Project } from '@/lib/types';
import { t } from '@/lib/i18n';
import ProjectCard from '../projects/ProjectCard';
import SectionTitle from '../ui/SectionTitle';

interface Props {
  lang: Lang;
  projects: Project[];
}

export default function FeaturedProjects({ lang, projects }: Props) {
  return (
    <section className="py-16 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t(lang, 'home.featuredProjects')} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} lang={lang} />
          ))}
        </div>
        <div className="text-center">
          <Link
            href={`/${lang}/proyectos/`}
            className="inline-flex items-center gap-2 text-primary-800 font-semibold hover:text-accent transition-colors border-b-2 border-primary-800 hover:border-accent pb-0.5"
          >
            {t(lang, 'home.seeAllProjects')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
