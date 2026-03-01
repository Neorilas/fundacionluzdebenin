import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';
const LANGS = ['es', 'fr'];

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/que-hacemos', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/quienes-somos', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/colabora', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/proyectos', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/contacto', priority: 0.6, changeFrequency: 'yearly' as const },
  { path: '/apadrina-gallina', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/apadrina-oveja', priority: 0.8, changeFrequency: 'monthly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap(({ path, priority, changeFrequency }) =>
    LANGS.map(lang => ({
      url: `${SITE_URL}/${lang}${path}/`,
      lastModified: now,
      changeFrequency,
      priority,
    }))
  );

  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const projects = await api.getProjects();
    projectEntries = projects.flatMap(p =>
      LANGS.map(lang => ({
        url: `${SITE_URL}/${lang}/proyectos/${p.slug}/`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    );
  } catch { /* skip if API unavailable at build time */ }

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await api.getBlogPosts();
    blogEntries = posts.flatMap(p =>
      LANGS.map(lang => ({
        url: `${SITE_URL}/${lang}/blog/${p.slug}/`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    );
  } catch { /* skip if API unavailable at build time */ }

  return [...staticEntries, ...projectEntries, ...blogEntries];
}
