'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function NewsletterInline({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const result = await api.subscribeNewsletter(email, lang);
      if (result.success) {
        router.push(`/${lang}/gracias?type=newsletter`);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-8 bg-primary-50 border border-primary-100 rounded-xl px-6 py-6 text-center">
      <p className="text-sm font-semibold text-primary-800 mb-1">{t(lang, 'newsletter.donorTitle')}</p>
      <p className="text-xs text-gray-600 mb-4">{t(lang, 'newsletter.donorSubtitle')}</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t(lang, 'newsletter.placeholder')}
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-primary-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'sending' ? t(lang, 'newsletter.sending') : t(lang, 'newsletter.button')}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-600 text-xs mt-2">{t(lang, 'newsletter.error')}</p>
      )}
      <p className="text-gray-400 text-xs mt-3">{t(lang, 'newsletter.privacy')}</p>
    </div>
  );
}
