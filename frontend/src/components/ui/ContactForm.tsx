'use client';

import { useState, FormEvent } from 'react';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';

interface Props {
  lang: Lang;
}

export default function ContactForm({ lang }: Props) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.sendContact(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          ✓ {t(lang, 'contact.form.success')}
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          ✗ {t(lang, 'contact.form.error')}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.name')}</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.email')}</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.subject')}</label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => set('subject', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'contact.form.message')}</label>
        <textarea
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
