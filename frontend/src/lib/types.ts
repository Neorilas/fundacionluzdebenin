export interface Project {
  id: string;
  slug: string;
  titleEs: string;
  titleFr: string;
  descEs: string;
  descFr: string;
  status: 'active' | 'completed' | 'planned';
  featured: boolean;
  images: string[];
  stats: Record<string, string | number>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleEs: string;
  titleFr: string;
  excerptEs: string;
  excerptFr: string;
  contentEs?: string;
  contentFr?: string;
  coverImage: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface PageSections {
  [section: string]: {
    [key: string]: { es: string; fr: string };
  };
}

export interface Settings {
  siteName?: string;
  siteNameFr?: string;
  emailContact?: string;
  phoneContact?: string;
  address?: string;
  bankAccount?: string;
  bankIban?: string;
  bankBic?: string;
  socialFacebook?: string;
  socialInstagram?: string;
}

export type Lang = 'es' | 'fr';

export interface StripeProduct {
  id: string;
  nameEs: string;
  nameFr: string;
  descEs: string;
  descFr: string;
  amount: number;
  interval: string;
  order: number;
}

export interface CheckoutPayload {
  type: 'one_time' | 'subscription';
  amount?: number;
  stripeProductId?: string;
  donorName?: string;
  donorEmail?: string;
  donorDni?: string;
  lang: Lang;
}
