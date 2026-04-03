'use client';

import { trackEvent } from '@/lib/analytics';

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

/**
 * Drop-in replacement for <a href="mailto:..."> that fires a GA4 event on click.
 */
export default function TrackedMailto({ children, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={() => trackEvent('clic_email_contacto', { email: rest.href?.replace('mailto:', '') || '' })}
    >
      {children}
    </a>
  );
}
