'use client';

import { useState } from 'react';
import { Lang } from '@/lib/types';

interface Props {
  lang: Lang;
  amount: number; // en céntimos
  label: string;
  className?: string;
  showAnimalName?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function SponsorButton({ lang, amount, label, className, showAnimalName }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animalName, setAnimalName] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API_URL}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          amount,
          lang,
          ...(showAnimalName && animalName.trim() ? { animalName: animalName.trim() } : {}),
        }),
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
      {showAnimalName && (
        <div className="mb-5">
          <input
            type="text"
            value={animalName}
            onChange={e => setAnimalName(e.target.value)}
            placeholder={lang === 'es' ? 'Dale un nombre (opcional)' : 'Donnez-lui un nom (facultatif)'}
            maxLength={50}
            className="w-full max-w-xs mx-auto block border border-gray-300 rounded-full px-5 py-3 text-center text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm"
          />
        </div>
      )}
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
