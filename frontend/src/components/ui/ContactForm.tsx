'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';

interface Props {
  lang: Lang;
}

export default function ContactForm({ lang }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.sendContact({ ...form, lang });
      router.push(`/${lang}/gracias?type=contact`);
    } catch {
      setStatus('error');
    }
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot: hidden field for bots — humans never fill this */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => set('website', e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
      />
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          ✗ {t(lang, 'contact.form.error')}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.name')}</label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.email')}</label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.subject')}</label>
        <input
          id="contact-subject"
          type="text"
          value={form.subject}
          onChange={(e) => set('subject', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.message')}</label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          required
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-primary-800 text-white font-semibold py-3 rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? t(lang, 'contact.form.sending') : t(lang, 'contact.form.send')}
      </button>
    </form>
  );
}
