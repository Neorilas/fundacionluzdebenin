import { Lang, Project } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFilterWrapper from '@/components/projects/ProjectFilterWrapper';

export const revalidate = 3600;

export default async function ProyectosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const projects: Project[] = await api.getProjects().catch(() => []);

  return (
    <div>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">{t(l, 'projects.title')}</h1>
          <p className="text-xl text-primary-100">{t(l, 'projects.subtitle')}</p>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProjectFilterWrapper lang={l} projects={projects} />
        </div>
      </section>
    </div>
  );
}
