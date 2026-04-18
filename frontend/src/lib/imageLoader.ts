/**
 * Custom Next.js Image loader that delegates resizing to the backend.
 * Appends ?w=WIDTH&q=QUALITY to /uploads/ URLs so the backend serves
 * optimized WebP versions on the fly with disk caching.
 *
 * For non-upload URLs (e.g. /logo.jpg), returns the URL as-is.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Only optimize /uploads/ images — static assets served as-is
  if (src.startsWith('/uploads/')) {
    return `${src}?w=${width}&q=${quality || 80}`;
  }
  return src;
}
