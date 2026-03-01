import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import Badge from '@/components/ui/Badge';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const isFr = lang === 'fr';
  try {
    const project = await api.getProject(slug);
    const title = isFr ? project.titleFr : project.titleEs;
    const description = isFr ? project.descFr : project.descEs;
    const image = project.images?.[0];
    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_URL}/${lang}/proyectos/${slug}/`,
        languages: {
          'es': `${SITE_URL}/es/proyectos/${slug}/`,
          'fr': `${SITE_URL}/fr/proyectos/${slug}/`,
          'x-default': `${SITE_URL}/es/proyectos/${slug}/`,
        },
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${lang}/proyectos/${slug}/`,
        ...(image && {
          images: [{ url: image.startsWith('http') ? image : `${SITE_URL}${image}`, alt: title }],
        }),
      },
    };
  } catch {
    return { title: isFr ? 'Projet' : 'Proyecto' };
  }
}

export async function generateStaticParams() {
  try {
    const projects = await api.getProjects();
    return projects.flatMap(p => [
      { lang: 'es', slug: p.slug },
      { lang: 'fr', slug: p.slug },
    ]);
  } catch {
    return [];
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const l = lang as Lang;

  let project;
  try {
    project = await api.getProject(slug);
  } catch {
    notFound();
  }

  const title = l === 'es' ? project.titleEs : project.titleFr;
  const desc = l === 'es' ? project.descEs : project.descFr;
  const statusLabel = t(l, `projects.status.${project.status}`);

  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      <Link href={`/${l}/proyectos/`} className="inline-flex items-center gap-1 text-sm text-primary-800 hover:text-accent mb-6 transition-colors">
        {t(l, 'projects.backToProjects')}
      </Link>

      <div className="mb-4">
        <Badge status={project.status} label={statusLabel} />
        {project.featured && <span className="ml-2 text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-medium">⭐ {l === 'es' ? 'Destacado' : 'En vedette'}</span>}
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{title}</h1>

      {project.images?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {project.images.map((img, i) => (
            <img key={i} src={img} alt={`${title} - ${i + 1}`} className="w-full h-64 object-cover rounded-2xl" />
          ))}
        </div>
      )}

      <p className="text-gray-700 text-lg leading-relaxed mb-8">{desc}</p>

      {Object.keys(project.stats || {}).length > 0 && (
        <div className="bg-primary-50 rounded-2xl p-6">
          <h2 className="font-bold text-primary-800 mb-4">{l === 'es' ? 'Datos del proyecto' : 'Données du projet'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(project.stats).map(([key, val]) => (
              <div key={key} className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl font-extrabold text-primary-800">{val}</div>
                <div className="text-xs text-muted capitalize mt-1">{key}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
