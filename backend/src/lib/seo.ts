import { stripMarkdown } from './textUtils';

/** Recommended upper bound for a <meta name="description"> (Google truncates ~155-160). */
export const META_DESC_MAX = 155;

/**
 * Turns Markdown/HTML body text into a plain-text meta description of at most
 * `max` characters, cut on a word boundary and ending in "…" when truncated.
 */
export function toMetaDescription(text: string, max = META_DESC_MAX): string {
  const withoutTagsOrBullets = (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, '');
  const plain = stripMarkdown(withoutTagsOrBullets)
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;

  const cut = plain.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s,;:.\-–—]+$/, '') + '…';
}

/** Uses the hand-written meta description if present, otherwise derives one from the body. */
export function resolveMetaDescription(custom: string | null | undefined, body: string): string {
  const manual = (custom || '').trim();
  return manual ? toMetaDescription(manual) : toMetaDescription(body);
}

/**
 * Computed SEO descriptions for a project, exposed by the public API as
 * seoDescEs / seoDescFr. French falls back to Spanish when empty.
 */
export function projectSeoDescriptions(p: {
  descEs: string; descFr: string; metaDescEs?: string | null; metaDescFr?: string | null;
}): { seoDescEs: string; seoDescFr: string } {
  const seoDescEs = resolveMetaDescription(p.metaDescEs, p.descEs);
  const seoDescFr = resolveMetaDescription(p.metaDescFr, p.descFr) || seoDescEs;
  return { seoDescEs, seoDescFr };
}

/** Recommended upper bound for a <title> before Google truncates it. */
export const TITLE_MAX = 60;

export const BRAND = {
  es: 'Fundación Luz de Benín',
  fr: 'Fondation Lumière du Bénin',
} as const;

/**
 * Final <title>: appends " | <brand>" only when it fits in `max` characters
 * and the brand is not already part of the title.
 */
export function buildSeoTitle(base: string, lang: 'es' | 'fr', max = TITLE_MAX): string {
  const brand = BRAND[lang];
  const title = (base || '').replace(/\s+/g, ' ').trim();
  if (!title) return brand;
  if (title.toLowerCase().includes(brand.toLowerCase())) return title;
  const withBrand = `${title} | ${brand}`;
  return withBrand.length <= max ? withBrand : title;
}

/** seoTitle* / seoDesc* for a blog post. French falls back to Spanish when empty. */
export function blogPostSeo(p: {
  titleEs: string; titleFr: string; metaTitleEs?: string | null; metaTitleFr?: string | null;
  excerptEs: string; excerptFr: string; contentEs: string; contentFr: string;
}) {
  const baseEs = (p.metaTitleEs || '').trim() || p.titleEs;
  const baseFr = (p.metaTitleFr || '').trim() || p.titleFr || baseEs;
  const seoDescEs = toMetaDescription(p.excerptEs || p.contentEs);
  const seoDescFr = toMetaDescription(p.excerptFr || p.contentFr) || seoDescEs;
  return {
    seoTitleEs: buildSeoTitle(baseEs, 'es'),
    seoTitleFr: buildSeoTitle(baseFr, 'fr'),
    seoDescEs,
    seoDescFr,
  };
}

/** seoTitle* for a project. French falls back to Spanish when empty. */
export function projectSeoTitles(p: { titleEs: string; titleFr: string }) {
  return {
    seoTitleEs: buildSeoTitle(p.titleEs, 'es'),
    seoTitleFr: buildSeoTitle(p.titleFr || p.titleEs, 'fr'),
  };
}

/** seoDesc* for a campaign: its meta description, or the tagline, capped to META_DESC_MAX. */
export function campaignSeoDescriptions(c: {
  metaDescEs?: string | null; metaDescFr?: string | null; taglineEs?: string | null; taglineFr?: string | null;
}) {
  const seoDescEs = resolveMetaDescription(c.metaDescEs, c.taglineEs || '');
  const seoDescFr = resolveMetaDescription(c.metaDescFr, c.taglineFr || '') || seoDescEs;
  return { seoDescEs, seoDescFr };
}
