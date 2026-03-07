import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const isFr = lang === 'fr';
  try {
    const post = await api.getBlogPost(slug);
    const title = isFr ? post.titleFr : post.titleEs;
    const description = isFr ? post.excerptFr : post.excerptEs;
    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_URL}/${lang}/blog/${slug}/`,
        languages: {
          'es': `${SITE_URL}/es/blog/${slug}/`,
          'fr': `${SITE_URL}/fr/blog/${slug}/`,
          'x-default': `${SITE_URL}/es/blog/${slug}/`,
        },
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${lang}/blog/${slug}/`,
        type: 'article',
        ...(post.publishedAt && { publishedTime: new Date(post.publishedAt).toISOString() }),
        images: post.coverImage
          ? [{ url: post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`, alt: title }]
          : [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 600, alt: title }],
      },
    };
  } catch {
    return { title: isFr ? 'Article' : 'Artículo' };
  }
}

export async function generateStaticParams() {
  try {
    const { posts } = await api.getBlogPosts(1, 1000);
    return posts.flatMap(p => [
      { lang: 'es', slug: p.slug },
      { lang: 'fr', slug: p.slug },
    ]);
  } catch {
    return [];
  }
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { lang, slug } = await params;
  const { preview } = await searchParams;
  const l = lang as Lang;

  const PREVIEW_SECRET = process.env.PREVIEW_SECRET || 'preview-luz-benin';
  const isPreview = preview === PREVIEW_SECRET;

  let post;
  try {
    if (isPreview) {
      const res = await fetch(
        `${process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/blog/preview/${slug}?secret=${PREVIEW_SECRET}`,
        { cache: 'no-store' }
      );
      if (!res.ok) notFound();
      post = await res.json();
    } else {
      post = await api.getBlogPost(slug);
    }
  } catch {
    notFound();
  }

  // Fetch all posts for prev/next navigation
  const allPosts = await api.getBlogPosts(1, 1000).then(r => r.posts).catch(() => []);
  const idx = allPosts.findIndex(p => p.slug === slug);
  const prevPost = idx > 0 ? allPosts[idx - 1] : null;
  const nextPost = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  const title = l === 'es' ? post.titleEs : post.titleFr;
  const content = l === 'es' ? (post.contentEs || '') : (post.contentFr || '');
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(l === 'es' ? 'es-ES' : 'fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const coverImageUrl = post.coverImage
    ? (post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`)
    : `${SITE_URL}/logo.jpg`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: l === 'es' ? post.excerptEs : post.excerptFr,
    image: coverImageUrl,
    url: `${SITE_URL}/${l}/blog/${slug}/`,
    ...(post.publishedAt && { datePublished: new Date(post.publishedAt).toISOString() }),
    author: {
      '@type': 'Organization',
      name: 'Fundación Luz de Benín',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Fundación Luz de Benín',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.jpg` },
    },
    inLanguage: l === 'es' ? 'es-ES' : 'fr-FR',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: l === 'es' ? 'Inicio' : 'Accueil', item: `${SITE_URL}/${l}/` },
      { '@type': 'ListItem', position: 2, name: l === 'es' ? 'Blog' : 'Actualité', item: `${SITE_URL}/${l}/blog/` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}/${l}/blog/${slug}/` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {isPreview && (
        <div className="bg-amber-400 text-amber-900 text-sm font-semibold text-center py-2 px-4">
          Vista previa — Este post aún no está publicado
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-16">
        <Link href={`/${l}/blog/`} className="inline-flex items-center gap-1 text-sm text-primary-800 hover:text-accent mb-6 transition-colors">
          {t(l, 'blog.backToBlog')}
        </Link>

        {post.coverImage && (
          <div className="relative h-72 rounded-2xl overflow-hidden mb-8">
            <Image src={post.coverImage} alt={post.coverImageAlt || title} fill unoptimized priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        {date && (
          <p className="text-sm text-muted mb-3">{t(l, 'blog.publishedOn')} {date}</p>
        )}

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">{title}</h1>

        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="overflow-x-auto my-6">
                  <table className="w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-primary-50 text-primary-900 font-semibold">{children}</thead>,
              th: ({ children }) => <th className="px-4 py-3 text-left border border-gray-200">{children}</th>,
              td: ({ children }) => <td className="px-4 py-3 border border-gray-200">{children}</td>,
              tr: ({ children }) => <tr className="even:bg-gray-50">{children}</tr>,
              img: ({ src, alt, title }) => {
                const align = title === 'left' ? 'mr-auto' : title === 'right' ? 'ml-auto' : 'mx-auto';
                const float = title === 'left' ? 'float-left mr-6 mb-4' : title === 'right' ? 'float-right ml-6 mb-4' : '';
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src || ''}
                    alt={alt || ''}
                    title={title && title !== 'left' && title !== 'right' ? title : undefined}
                    className={`rounded-lg my-6 max-w-full h-auto ${float || align} block`}
                  />
                );
              },
            }}
          >{content}</ReactMarkdown>
        </div>

        {/* Prev / Next navigation */}
        {(prevPost || nextPost) && (
          <nav className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 gap-4" aria-label={l === 'es' ? 'Navegación entre artículos' : 'Navigation entre articles'}>
            <div>
              {prevPost && (
                <Link href={`/${l}/blog/${prevPost.slug}/`} className="group flex flex-col gap-1 text-sm hover:text-accent transition-colors">
                  <span className="text-xs text-muted font-medium">← {l === 'es' ? 'Anterior' : 'Précédent'}</span>
                  <span className="font-semibold text-gray-900 group-hover:text-accent line-clamp-2 transition-colors">
                    {l === 'es' ? prevPost.titleEs : prevPost.titleFr}
                  </span>
                </Link>
              )}
            </div>
            <div className="text-right">
              {nextPost && (
                <Link href={`/${l}/blog/${nextPost.slug}/`} className="group flex flex-col gap-1 text-sm hover:text-accent transition-colors items-end">
                  <span className="text-xs text-muted font-medium">{l === 'es' ? 'Siguiente' : 'Suivant'} →</span>
                  <span className="font-semibold text-gray-900 group-hover:text-accent line-clamp-2 transition-colors">
                    {l === 'es' ? nextPost.titleEs : nextPost.titleFr}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </article>
    </>
  );
}
