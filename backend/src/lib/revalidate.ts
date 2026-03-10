const FRONTEND_URL = process.env.FRONTEND_INTERNAL_URL || 'http://frontend:3000';
const SECRET = process.env.REVALIDATE_SECRET || '';

const LANGS = ['es', 'fr'];

export const PATHS = {
  home: () => LANGS.map(l => `/${l}/`),
  projects: () => [...LANGS.map(l => `/${l}/proyectos/`), ...LANGS.map(l => `/${l}/`)],
  project: (slug: string) => [
    ...LANGS.map(l => `/${l}/proyectos/${slug}/`),
    ...LANGS.map(l => `/${l}/proyectos/`),
    ...LANGS.map(l => `/${l}/`),
  ],
  blog: () => [...LANGS.map(l => `/${l}/blog/`), ...LANGS.map(l => `/${l}/`)],
  blogPost: (slug: string) => [
    ...LANGS.map(l => `/${l}/blog/${slug}/`),
    ...LANGS.map(l => `/${l}/blog/`),
    ...LANGS.map(l => `/${l}/`),
  ],
  campaigns: () => [...LANGS.map(l => `/${l}/campanas/`), ...LANGS.map(l => `/${l}/`)],
  campaign: (slug: string) => [
    ...LANGS.map(l => `/${l}/campanas/${slug}/`),
    ...LANGS.map(l => `/${l}/campanas/`),
    ...LANGS.map(l => `/${l}/`),
  ],
};

export async function revalidate(paths: string[], tags?: string[]): Promise<void> {
  if (!SECRET) return;
  try {
    await fetch(`${FRONTEND_URL}/api/revalidate?secret=${SECRET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths, tags }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Non-critical — don't fail the API response
  }
}
