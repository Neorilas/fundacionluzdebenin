import Link from 'next/link';
import Image from 'next/image';
import { Lang } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  lang: Lang;
}

export default function Footer({ lang }: Props) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <Image
                src="/logo.jpg"
                alt="Fundación Luz de Benín"
                width={32}
                height={32}
                className="rounded-full object-cover mix-blend-screen"
              />
              Fundación Luz de Benín
            </div>
            <p className="text-sm text-primary-200 leading-relaxed">
              {t(lang, 'footer.tagline')}
            </p>
            <div className="flex gap-1 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800 transition-colors text-xl">f</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800 transition-colors text-lg">ig</a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-3">
              {lang === 'es' ? 'Navegación' : 'Navigation'}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: `/${lang}/que-hacemos/`, label: t(lang, 'nav.whatWeDo') },
                { href: `/${lang}/proyectos/`, label: t(lang, 'nav.projects') },
                { href: `/${lang}/quienes-somos/`, label: t(lang, 'nav.whoWeAre') },
                { href: `/${lang}/colabora/`, label: t(lang, 'nav.collaborate') },
                { href: `/${lang}/blog/`, label: t(lang, 'nav.blog') },
                { href: `/${lang}/contacto/`, label: t(lang, 'nav.contact') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-primary-300 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Campañas */}
          <div>
            <h3 className="font-semibold text-white mb-3">
              {lang === 'es' ? 'Apadrina' : 'Parraine'}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                {
                  href: `/${lang}/campanas/apadrina-gallina/`,
                  label: lang === 'es' ? '🐔 Apadrina una gallina — 5€/mes' : '🐔 Parraine une poule — 5€/mois',
                },
                {
                  href: `/${lang}/campanas/apadrina-oveja/`,
                  label: lang === 'es' ? '🐑 Apadrina una oveja — 10€/mes' : '🐑 Parraine une brebis — 10€/mois',
                },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-primary-300 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-3">
              {lang === 'es' ? 'Contacto' : 'Contact'}
            </h3>
            <ul className="space-y-2 text-sm text-primary-300">
              <li>📧 info@fundacionluzdebenin.org</li>
              <li>📞 +34 612 345 678</li>
              <li>📍 Madrid, España</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-400">
          <p>© {currentYear} Fundación Luz de Benín. {t(lang, 'footer.rights')}</p>
          <div className="flex gap-4">
            <Link href={`/${lang}/`} className="hover:text-white transition-colors">{t(lang, 'footer.legal')}</Link>
            <Link href={`/${lang}/`} className="hover:text-white transition-colors">{t(lang, 'footer.privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
