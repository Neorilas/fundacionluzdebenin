import Link from 'next/link';
import { Lang, BlogPost } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  post: BlogPost;
  lang: Lang;
}

export default function BlogCard({ post, lang }: Props) {
  const title = lang === 'es' ? post.titleEs : post.titleFr;
  const excerpt = lang === 'es' ? post.excerptEs : post.excerptFr;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(lang === 'es' ? 'es-ES' : 'fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Cover */}
      <div className="h-40 bg-gradient-to-br from-primary-100 to-accent-100 relative overflow-hidden">
        {post.coverImage ? (
          <img src={post.coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl">📰</div>
        )}
      </div>

      <div className="p-5">
        {date && <p className="text-xs text-muted mb-2">{date}</p>}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted line-clamp-3 mb-4">{excerpt}</p>
        <Link
          href={`/${lang}/blog/${post.slug}/`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-800 hover:text-accent transition-colors"
        >
          {t(lang, 'blog.readMore')} →
        </Link>
      </div>
    </article>
  );
}
