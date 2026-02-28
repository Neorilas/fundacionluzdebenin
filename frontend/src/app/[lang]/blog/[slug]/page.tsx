import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await api.getBlogPosts();
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
        <img src={post.coverImage} alt={title} className="w-full h-72 object-cover rounded-2xl mb-8" />
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
