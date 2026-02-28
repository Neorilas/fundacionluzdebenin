import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import BlogCard from '@/components/blog/BlogCard';
import SectionTitle from '@/components/ui/SectionTitle';

export const revalidate = 60;

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const posts = await api.getBlogPosts().catch(() => []);

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
            <div className="text-center py-20 text-muted">
              {l === 'es' ? 'No hay artículos publicados aún.' : 'Aucun article publié pour l\'instant.'}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(p => <BlogCard key={p.id} post={p} lang={l} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
