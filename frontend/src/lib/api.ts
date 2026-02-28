import { Project, BlogPost, PageSections, Settings } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`);
  return res.json();
}

export const api = {
  getProjects: (params?: { status?: string; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.featured) qs.set('featured', 'true');
    return fetchAPI<Project[]>(`/api/projects${qs.toString() ? '?' + qs : ''}`);
  },
  getProject: (slug: string) => fetchAPI<Project>(`/api/projects/${slug}`),
  getBlogPosts: () => fetchAPI<BlogPost[]>('/api/blog'),
  getBlogPost: (slug: string) => fetchAPI<BlogPost>(`/api/blog/${slug}`),
  getPageSections: (page: string) => fetchAPI<PageSections>(`/api/pages/${page}`),
  getSettings: () => fetchAPI<Settings>('/api/settings'),
  sendContact: (data: { name: string; email: string; subject: string; message: string }) =>
    fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
};
