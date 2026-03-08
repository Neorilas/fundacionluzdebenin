import { Project, BlogPost, PageSections, Settings, StripeProduct, CheckoutPayload, Campaign, Faq } from './types';

// API_INTERNAL_URL (non-NEXT_PUBLIC) is read at runtime on the server side,
// allowing ISR/SSR to call the backend directly via Docker network when
// the public domain DNS hasn't been updated yet.
const API_URL = process.env.API_INTERNAL_URL
  || process.env.NEXT_PUBLIC_API_URL
  || 'http://localhost:3001';

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 3600 },
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
  getBlogPosts: (page = 1, limit = 9) =>
    fetchAPI<{ posts: BlogPost[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/blog?page=${page}&limit=${limit}`
    ),
  getBlogPost: (slug: string) => fetchAPI<BlogPost>(`/api/blog/${slug}`),
  getPageSections: (page: string) => fetchAPI<PageSections>(`/api/pages/${page}`),
  getSettings: () => fetchAPI<Settings>('/api/settings'),
  sendContact: (data: { name: string; email: string; subject: string; message: string; lang?: string; website?: string }) =>
    fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  subscribeNewsletter: (email: string, lang: string) =>
    fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, lang }),
    }).then(r => r.json()) as Promise<{ success?: boolean; error?: string; alreadySubscribed?: boolean }>,
  getCampaigns: () => fetchAPI<Campaign[]>('/api/campaigns'),
  getCampaign: (slug: string) => fetchAPI<Campaign>(`/api/campaigns/${slug}`),
  getFaqs: () => fetchAPI<Faq[]>('/api/faqs'),
  getStripeProducts: () =>
    fetch(`${API_URL}/api/stripe/products`).then(r => r.json()) as Promise<StripeProduct[]>,
  createCheckout: (payload: CheckoutPayload) =>
    fetch(`${API_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()) as Promise<{ url: string; error?: string }>,
};
