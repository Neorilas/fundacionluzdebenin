'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * Fires a GA4 event once when the page mounts.
 * Render it anywhere in a server component page to track a virtual pageview.
 */
export default function PageViewTracker({ eventName, params }: {
  eventName: string;
  params?: Record<string, string>;
}) {
  useEffect(() => {
    trackEvent(eventName, params);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
