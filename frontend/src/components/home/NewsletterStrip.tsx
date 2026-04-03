'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

export default function NewsletterStrip({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const result = await api.subscribeNewsletter(email, lang);
      if (result.success) {
        trackEvent('suscripcion_newsletter', { ubicacion: 'strip' });
        router.push(`/${lang}/gracias?type=newsletter`);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="bg-primary-800 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="text-2xl font-extrabold text-white mb-3">{t(lang, 'newsletter.title')}</h2>
        <p className="text-primary-200 mb-8 text-sm leading-relaxed">{t(lang, 'newsletter.subtitle')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t(lang, 'newsletter.placeholder')}
              required
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-800 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'sending' ? t(lang, 'newsletter.sending') : t(lang, 'newsletter.button')}
            </button>
          </form>
        {status === 'error' && (
          <p className="text-red-300 text-sm mt-3">{t(lang, 'newsletter.error')}</p>
        )}

        <p className="text-primary-300 text-xs mt-5">{t(lang, 'newsletter.privacy')}</p>
      </div>
    </section>
  );
}
