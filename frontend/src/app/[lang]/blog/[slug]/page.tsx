import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';

export const revalidate = 60;

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
        ...(post.coverImage && {
          images: [{ url: post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`, alt: title }],
        }),
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

export default async function BlogPostPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const l = lang as Lang;

  let post;
  try {
    post = await api.getBlogPost(slug);
  } catch {
    notFound();
  }

  const title = l === 'es' ? post.titleEs : post.titleFr;
  const content = l === 'es' ? (post.contentEs || '') : (post.contentFr || '');
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(l === 'es' ? 'es-ES' : 'fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <Link href={`/${l}/blog/`} className="inline-flex items-center gap-1 text-sm text-primary-800 hover:text-accent mb-6 transition-colors">
        {t(l, 'blog.backToBlog')}
      </Link>

      {post.coverImage && (
        <div className="relative h-72 rounded-2xl overflow-hidden mb-8">
          <Image src={post.coverImage} alt={title} fill unoptimized priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>
      )}

      {date && (
        <p className="text-sm text-muted mb-3">{t(l, 'blog.publishedOn')} {date}</p>
      )}

      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">{title}</h1>

      <div className="prose max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </article>
  );
}
