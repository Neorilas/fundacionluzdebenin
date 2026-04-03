/**
 * GA4 event helper — safe to call even when gtag hasn't loaded (consent
 * rejected, script still loading, SSR, etc.).  Does nothing in those cases.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GtagFn = (...args: any[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}
