'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lang } from '@/lib/types';

const CONSENT_KEY = 'cookie_consent';

export function getConsent(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CONSENT_KEY);
}

export default function CookieBanner({ lang }: { lang: Lang }) {
  const [visible, setVisible] = useState(false);
  const es = lang === 'es';

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
    window.dispatchEvent(new Event('cookie_consent_accepted'));
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-2xl border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-300 leading-relaxed">
          <span className="text-white font-semibold">🍪 {es ? 'Cookies' : 'Cookies'} </span>
          {es
            ? 'Usamos cookies analíticas (Google Analytics) para mejorar la web. No compartimos datos con terceros.'
            : 'Nous utilisons des cookies analytiques (Google Analytics) pour améliorer le site. Aucun partage avec des tiers.'}
          {' '}
          <Link href={`/${lang}/aviso-legal/#cookies`} className="underline hover:text-white text-gray-400 whitespace-nowrap">
            {es ? 'Política de cookies' : 'Politique de cookies'}
          </Link>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 rounded-lg transition-colors"
          >
            {es ? 'Solo esenciales' : 'Essentiels uniquement'}
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-sm font-bold bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            {es ? 'Aceptar' : 'Accepter'}
          </button>
        </div>
      </div>
    </div>
  );
}
