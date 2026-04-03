'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface Props extends React.ComponentProps<typeof Link> {
  eventName: string;
  eventParams?: Record<string, string>;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for next/Link that fires a GA4 event on click.
 * Works inside server components (it's a client component itself).
 */
export default function TrackedLink({ eventName, eventParams, children, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={() => trackEvent(eventName, eventParams)}
    >
      {children}
    </Link>
  );
}
