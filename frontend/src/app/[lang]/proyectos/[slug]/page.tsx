import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lang, parseProjectImage, SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import Badge from '@/components/ui/Badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const isFr = lang === 'fr';
  try {
    const project = await api.getProject(slug);
    const title = isFr ? project.titleFr : project.titleEs;
    const description = isFr ? project.descFr : project.descEs;
    const image = project.images?.[0] ? parseProjectImage(project.images[0]) : null;
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
        images: image
          ? [{ url: image.url.startsWith('http') ? image.url : `${SITE_URL}${image.url}`, alt: image.alt || title }]
          : [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 600, alt: title }],
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

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: l === 'es' ? 'Inicio' : 'Accueil', item: `${SITE_URL}/${l}/` },
      { '@type': 'ListItem', position: 2, name: l === 'es' ? 'Proyectos' : 'Projets', item: `${SITE_URL}/${l}/proyectos/` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}/${l}/proyectos/${slug}/` },
    ],
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
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
          {project.images.map((raw, i) => {
            const img = parseProjectImage(raw);
            return (
              <div key={i} className="relative h-64 rounded-2xl overflow-hidden">
                <Image src={img.url} alt={img.alt || `${title} — imagen ${i + 1}`} fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
              </div>
            );
          })}
        </div>
      )}

      <div className="prose max-w-none mb-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
      </div>

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
    </>
  );
}
