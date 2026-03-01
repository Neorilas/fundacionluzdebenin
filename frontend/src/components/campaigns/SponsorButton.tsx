'use client';

import { useState } from 'react';
import { Lang } from '@/lib/types';

interface Props {
  lang: Lang;
  amount: number; // en céntimos
  label: string;
  className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function SponsorButton({ lang, amount, label, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API_URL}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription', amount, lang }),
      });
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(lang === 'es' ? 'Error al procesar. Inténtalo de nuevo.' : 'Erreur. Réessayez.');
        setLoading(false);
      }
    } catch {
      setError(lang === 'es' ? 'Error al procesar. Inténtalo de nuevo.' : 'Erreur. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? (lang === 'es' ? 'Redirigiendo a Stripe…' : 'Redirection vers Stripe…') : label}
      </button>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}
