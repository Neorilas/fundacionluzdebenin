import type { Metadata } from 'next';
import Link from 'next/link';
import { Lang, SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import BlogCard from '@/components/blog/BlogCard';

export const revalidate = 600;
const LIMIT = 9;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr
    ? 'Actualité — Fondation Lumière du Bénin'
    : 'Blog y Noticias — Fundación Luz de Benín';
  const description = isFr
    ? "Suivez l'actualité de la Fondation Lumière du Bénin : nouvelles des projets, témoignages du terrain et rapports d'activité."
    : 'Sigue la actualidad de la Fundación Luz de Benín: novedades de proyectos, testimonios del terreno e informes de actividad.';
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/blog/`,
      languages: {
        'es': `${SITE_URL}/es/blog/`,
        'fr': `${SITE_URL}/fr/blog/`,
        'x-default': `${SITE_URL}/es/blog/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/blog/`,
      images: [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 600, alt: title }],
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang } = await params;
  const { page: pageParam } = await searchParams;
  const l = lang as Lang;
  const page = Math.max(parseInt(pageParam || '1'), 1);

  const { posts, totalPages } = await api.getBlogPosts(page, LIMIT).catch(() => ({
    posts: [], total: 0, page: 1, limit: LIMIT, totalPages: 0,
  }));

  return (
    <div>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">{t(l, 'blog.title')}</h1>
          <p className="text-xl text-primary-100">{t(l, 'blog.subtitle')}</p>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {l === 'es' ? 'No hay artículos publicados aún.' : "Aucun article publié pour l'instant."}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(p => <BlogCard key={p.id} post={p} lang={l} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {page > 1 && (
                <Link
                  href={`/${l}/blog/?page=${page - 1}`}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← {l === 'es' ? 'Anterior' : 'Précédent'}
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <Link
                  key={n}
                  href={`/${l}/blog/?page=${n}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    n === page
                      ? 'bg-primary-800 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/${l}/blog/?page=${page + 1}`}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {l === 'es' ? 'Siguiente' : 'Suivant'} →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
