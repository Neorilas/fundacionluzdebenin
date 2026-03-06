'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getConsent } from './CookieBanner';

const GA_ID = 'G-1SRJRDK6DD';

// Visit /?ga_internal=1 once to mark this browser as internal traffic.
// Visit /?ga_internal=0 to clear the flag.
function useInternalTraffic() {
  const [isInternal, setIsInternal] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ga_internal') === '1') {
      localStorage.setItem('ga_internal', '1');
    } else if (params.get('ga_internal') === '0') {
      localStorage.removeItem('ga_internal');
    }
    setIsInternal(localStorage.getItem('ga_internal') === '1');
  }, []);
  return isInternal;
}

export default function Analytics() {
  const [consented, setConsented] = useState(false);
  const isInternal = useInternalTraffic();

  useEffect(() => {
    if (getConsent() === 'accepted') {
      setConsented(true);
    }
    const handler = () => setConsented(true);
    window.addEventListener('cookie_consent_accepted', handler);
    return () => window.removeEventListener('cookie_consent_accepted', handler);
  }, []);

  if (!consented) return null;

  const configExtra = isInternal ? ", {'traffic_type': 'internal'}" : '';

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}'${configExtra});
      `}</Script>
    </>
  );
}
