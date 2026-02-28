import Link from 'next/link';
import { Lang, BlogPost } from '@/lib/types';
import { t } from '@/lib/i18n';
import BlogCard from '../blog/BlogCard';
import SectionTitle from '../ui/SectionTitle';

interface Props {
  lang: Lang;
  posts: BlogPost[];
}

export default function LatestBlog({ lang, posts }: Props) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t(lang, 'home.latestBlog')} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.slice(0, 3).map((post) => (
            <BlogCard key={post.id} post={post} lang={lang} />
          ))}
        </div>
        <div className="text-center">
          <Link
            href={`/${lang}/blog/`}
            className="inline-flex items-center gap-2 text-primary-800 font-semibold hover:text-accent transition-colors border-b-2 border-primary-800 hover:border-accent pb-0.5"
          >
            {t(lang, 'home.seeAllPosts')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
