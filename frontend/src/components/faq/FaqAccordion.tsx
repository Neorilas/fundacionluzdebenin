'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
            <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-primary-800 flex items-center justify-center transition-transform ${open === i ? 'rotate-45' : ''}`}>
              <svg className="w-3 h-3 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 bg-white text-gray-600 leading-relaxed whitespace-pre-line">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
