import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lang, SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const isFr = lang === 'fr';
  try {
    const post = await api.getBlogPost(slug);
    const title = isFr ? post.titleFr : post.titleEs;
    const description = isFr ? post.excerptFr : post.excerptEs;
    const metaTitle = isFr ? (post.metaTitleFr || title) : (post.metaTitleEs || title);
    return {
      title: metaTitle,
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

  const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  let post;
  type RelatedPost = { slug: string; coverImage?: string; titleEs: string; titleFr: string; excerptEs?: string; excerptFr?: string; publishedAt?: string };
  let relatedPostsData: RelatedPost[] = [];
  let allPosts: { slug: string; titleEs: string; titleFr: string }[] = [];

  if (isPreview) {
    // Preview: fetch draft sequentially (no-store), then related + allPosts in parallel
    try {
      const res = await fetch(`${API_BASE}/api/blog/preview/${slug}?secret=${PREVIEW_SECRET}`, { cache: 'no-store' });
      if (!res.ok) notFound();
      post = await res.json();
    } catch {
      notFound();
    }
    [relatedPostsData, allPosts] = await Promise.all([
      fetch(`${API_BASE}/api/blog/${slug}/related`, { cache: 'no-store' })
        .then(r => r.ok ? r.json() as Promise<RelatedPost[]> : []).catch(() => []),
      fetch(`${API_BASE}/api/blog?page=1&limit=50`, { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json().then((d: { posts: { slug: string; titleEs: string; titleFr: string }[] }) => d.posts) : []).catch(() => []),
    ]);
  } else {
    // Published post: run all 3 fetches in parallel
    const [postResult, related, allPostsResult] = await Promise.all([
      fetch(`${API_BASE}/api/blog/${slug}`, { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/api/blog/${slug}/related`, { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json() as Promise<RelatedPost[]> : []).catch(() => []),
      fetch(`${API_BASE}/api/blog?page=1&limit=50`, { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json().then((d: { posts: { slug: string; titleEs: string; titleFr: string }[] }) => d.posts) : []).catch(() => []),
    ]);
    if (!postResult) notFound();
    post = postResult;
    relatedPostsData = related;
    allPosts = allPostsResult;
  }
  const idx = allPosts.findIndex(p => p.slug === slug);
  const prevPost = idx > 0 ? allPosts[idx - 1] : null;
  const nextPost = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  const title = l === 'es' ? post.titleEs : post.titleFr;
  const content = l === 'es' ? (post.contentEs || '') : (post.contentFr || '');

  // Reading time
  const words = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter((w: string) => w.length > 0).length;
  const readingMin = Math.max(1, Math.round(words / 200));
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
            <Image src={post.coverImage} alt={post.coverImageAlt || title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-muted mb-3 flex-wrap">
          {date && <span>{t(l, 'blog.publishedOn')} {date}</span>}
          <span>·</span>
          <span>{readingMin} {l === 'es' ? 'min de lectura' : 'min de lecture'}</span>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">{title}</h1>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Related posts */}
        {relatedPostsData.length > 0 && (
          <aside className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {l === 'es' ? 'Artículos relacionados' : 'Articles liés'}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPostsData.map((rp: { slug: string; coverImage?: string; titleEs: string; titleFr: string; excerptEs?: string; excerptFr?: string; publishedAt?: string }) => (
                <Link key={rp.slug} href={`/${l}/blog/${rp.slug}/`} className="group flex flex-col gap-2 rounded-xl border border-gray-200 overflow-hidden hover:border-primary-800 transition-colors">
                  {rp.coverImage && (
                    <div className="relative h-32 bg-gray-100">
                      <Image src={rp.coverImage} alt={l === 'es' ? rp.titleEs : rp.titleFr} fill sizes="300px" className="object-cover" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-800 line-clamp-2 transition-colors">
                      {l === 'es' ? rp.titleEs : rp.titleFr}
                    </p>
                    {(l === 'es' ? rp.excerptEs : rp.excerptFr) && (
                      <p className="text-xs text-muted mt-1 line-clamp-2">{l === 'es' ? rp.excerptEs : rp.excerptFr}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}

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
