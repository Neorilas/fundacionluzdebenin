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
  foundationNif?: string;
  foundationRegistry?: string;
  showEmail?: string;
  showPhone?: string;
  showAddress?: string;
}

export type Lang = 'es' | 'fr';

export interface CoverItem { icon: string; textEs: string; textFr: string; }
export interface StatItem  { value: string; labelEs: string; labelFr: string; }
export interface WhyItem   { icon: string; textEs: string; textFr: string; }

export interface Campaign {
  id: string;
  slug: string;
  emoji: string;
  amountCents: number;
  colorScheme: string;
  active: boolean;
  sortOrder: number;
  tagEs: string; tagFr: string;
  titleEs: string; titleFr: string;
  taglineEs: string; taglineFr: string;
  priceLabel: string;
  periodEs: string; periodFr: string;
  ctaEs: string; ctaFr: string;
  fineEs: string; fineFr: string;
  coverItems: CoverItem[];
  projectTitleEs: string; projectTitleFr: string;
  projectTextEs: string; projectTextFr: string;
  projectBadgeEs: string; projectBadgeFr: string;
  projectLinkEs: string; projectLinkFr: string;
  projectHref: string;
  extraType: string;
  extraTitleEs: string; extraTitleFr: string;
  extraItems: (StatItem | WhyItem)[];
  ctaBottomEs: string; ctaBottomFr: string;
  ctaBottomNoteEs: string; ctaBottomNoteFr: string;
  metaTitleEs: string; metaTitleFr: string;
  metaDescEs: string; metaDescFr: string;
  createdAt: string;
  updatedAt: string;
}

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
