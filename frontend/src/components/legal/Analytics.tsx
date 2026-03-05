'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getConsent } from './CookieBanner';

const GA_ID = 'G-1SRJRDK6DD';

export default function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (getConsent() === 'accepted') {
      setConsented(true);
    }
    const handler = () => setConsented(true);
    window.addEventListener('cookie_consent_accepted', handler);
    return () => window.removeEventListener('cookie_consent_accepted', handler);
  }, []);

  if (!consented) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
    </>
  );
}
