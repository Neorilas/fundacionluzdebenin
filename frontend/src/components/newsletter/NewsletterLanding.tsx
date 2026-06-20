'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

export default function NewsletterLanding({ lang, logoUrl }: { lang: Lang; logoUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const result = await api.subscribeNewsletter(email, lang, 'landing');
      if (result.success) {
        trackEvent('suscripcion_newsletter', { ubicacion: 'landing' });
        router.push(`/${lang}/gracias?type=newsletter`);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const bullets = [
    t(lang, 'newsletterLanding.bullet1'),
    t(lang, 'newsletterLanding.bullet3'),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src={logoUrl}
            alt="Fundación Luz de Benín"
            width={88}
            height={88}
            className="rounded-full bg-white/90 p-1 shadow-lg"
            unoptimized
          />
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase bg-accent/20 text-accent-100 ring-1 ring-accent/40">
          ✉️ {t(lang, 'newsletterLanding.badge')}
        </span>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-6 mb-4 leading-tight">
          {t(lang, 'newsletterLanding.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-primary-100 text-base leading-relaxed mb-8">
          {t(lang, 'newsletterLanding.subtitle')}
        </p>

        {/* Bullets */}
        <ul className="inline-block text-left space-y-3 mb-10">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-primary-50 text-sm">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                ✓
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t(lang, 'newsletter.placeholder')}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-accent text-white font-bold px-6 py-3.5 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {status === 'sending' ? t(lang, 'newsletter.sending') : t(lang, 'newsletterLanding.cta')}
            </button>
          </form>
          {status === 'error' && (
            <p className="text-red-600 text-sm mt-3">{t(lang, 'newsletter.error')}</p>
          )}
          <p className="text-gray-400 text-xs mt-4">{t(lang, 'newsletterLanding.privacy')}</p>
        </div>

        {/* Language switch */}
        <div className="mt-8 text-xs text-primary-200">
          <a
            href={`/${lang === 'es' ? 'fr' : 'es'}/suscribete/`}
            className="hover:text-white underline underline-offset-2"
          >
            {lang === 'es' ? 'Français' : 'Español'}
          </a>
        </div>
      </div>
    </div>
  );
}
