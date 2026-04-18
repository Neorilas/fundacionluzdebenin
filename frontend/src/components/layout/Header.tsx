'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';
import { trackEvent } from '@/lib/analytics';
import LangSwitcher from './LangSwitcher';

interface Props {
  lang: Lang;
  logoUrl?: string;
}

export default function Header({ lang, logoUrl = '/logo.jpg' }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: `/${lang}/`, label: t(lang, 'nav.home'), cta: false },
    { href: `/${lang}/que-hacemos/`, label: t(lang, 'nav.whatWeDo'), cta: false },
    { href: `/${lang}/proyectos/`, label: t(lang, 'nav.projects'), cta: false },
    { href: `/${lang}/quienes-somos/`, label: t(lang, 'nav.whoWeAre'), cta: false },
    { href: `/${lang}/blog/`, label: t(lang, 'nav.blog'), cta: false },
    { href: `/${lang}/contacto/`, label: t(lang, 'nav.contact'), cta: false },
    { href: `/${lang}/colabora/`, label: t(lang, 'common.donate'), cta: true },
  ];

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname === href.slice(0, -1);

  return (
    <header className="sticky top-0 z-50 bg-primary-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${lang}/`} className="flex items-center gap-2 font-bold text-lg">
            <Image
              src={logoUrl}
              alt="Fundación Luz de Benín"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="hidden sm:inline">Fundación Luz de Benín</span>
            <span className="sm:hidden">FLdB</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map(({ href, label, cta }) => (
              <Link
                key={href}
                href={href}
                onClick={cta ? () => trackEvent('clic_donar', { ubicacion: 'header' }) : undefined}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  cta
                    ? 'bg-orange-700 hover:bg-orange-800 text-white font-semibold ml-2'
                    : isActive(href)
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LangSwitcher lang={lang} />
            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-md text-primary-100 hover:bg-primary-700"
              aria-label="Menu"
              aria-expanded={open}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden py-3 border-t border-primary-700">
            {links.map(({ href, label, cta }) => (
              <Link
                key={href}
                href={href}
                onClick={() => { setOpen(false); if (cta) trackEvent('clic_donar', { ubicacion: 'header_mobile' }); }}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  cta
                    ? 'mt-2 bg-orange-700 text-white font-semibold text-center'
                    : isActive(href)
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
