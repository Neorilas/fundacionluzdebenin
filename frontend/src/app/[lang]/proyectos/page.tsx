'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Lang, Project } from '@/lib/types';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFilter from '@/components/projects/ProjectFilter';

export default function ProyectosPage() {
  const { lang } = useParams<{ lang: string }>();
  const l = lang as Lang;
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

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
          <ProjectFilter lang={l} active={filter} onChange={setFilter} />
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-800"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => <ProjectCard key={p.id} project={p} lang={l} />)}
              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-20 text-muted">
                  {l === 'es' ? 'No hay proyectos en esta categoría' : 'Aucun projet dans cette catégorie'}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
