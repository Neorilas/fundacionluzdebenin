'use client';

import { useState } from 'react';
import { Lang, Project } from '@/lib/types';
import ProjectCard from './ProjectCard';
import ProjectFilter from './ProjectFilter';

interface Props {
  lang: Lang;
  projects: Project[];
}

export default function ProjectFilterWrapper({ lang, projects }: Props) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <>
      <ProjectFilter lang={lang} active={filter} onChange={setFilter} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => <ProjectCard key={p.id} project={p} lang={lang} />)}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-20 text-muted">
            {lang === 'es' ? 'No hay proyectos en esta categoría' : 'Aucun projet dans cette catégorie'}
          </div>
        )}
      </div>
    </>
  );
}
