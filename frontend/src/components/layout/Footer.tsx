import Link from 'next/link';
import Image from 'next/image';
import { Lang, Settings, Campaign } from '@/lib/types';
import { t } from '@/lib/i18n';
import { api } from '@/lib/api';

interface Props {
  lang: Lang;
}

export default async function Footer({ lang }: Props) {
  const currentYear = new Date().getFullYear();
  const [settings, campaigns] = await Promise.all([
    api.getSettings().catch(() => ({} as Settings)),
    api.getCampaigns().catch(() => [] as Campaign[]),
  ]);

  const fbUrl = settings.socialFacebook || 'https://facebook.com';
  const igUrl = settings.socialInstagram || 'https://instagram.com';
  const logoUrl = settings.logoUrl || '/logo.jpg';

  return (
    <footer className="bg-primary-900 text-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <Image
                src={logoUrl}
                alt="Fundación Luz de Benín"
                width={800}
                height={533}
                className="w-8 h-8 rounded-full object-cover"
                unoptimized
              />
              Fundación Luz de Benín
            </div>
            <p className="text-sm text-primary-200 leading-relaxed">
              {t(lang, 'footer.tagline')}
            </p>
            <div className="flex gap-1 mt-4">
              <a href={fbUrl} target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href={igUrl} target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
                </svg>
              </a>
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
          {campaigns.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3">
                {lang === 'es' ? 'Apadrina' : 'Parraine'}
              </h3>
              <ul className="space-y-2 text-sm">
                {campaigns.filter(c => c.active).map(c => {
                  const title = lang === 'es' ? c.titleEs : c.titleFr;
                  const period = lang === 'es' ? c.periodEs : c.periodFr;
                  return (
                    <li key={c.slug}>
                      <Link href={`/${lang}/campanas/${c.slug}/`} className="text-primary-300 hover:text-white transition-colors">
                        {c.emoji} {title} — {c.priceLabel}/{period}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-3">
              {lang === 'es' ? 'Contacto' : 'Contact'}
            </h3>
            <ul className="space-y-2 text-sm text-primary-300">
              {settings.showEmail !== '0' && (
                <li>
                  📧{' '}
                  <a href={`mailto:${settings.emailContact || 'info@fundacionluzdebenin.org'}`} className="hover:text-white transition-colors">
                    {settings.emailContact || 'info@fundacionluzdebenin.org'}
                  </a>
                </li>
              )}
              {settings.showPhone !== '0' && (
                <li>
                  📞{' '}
                  <a href={`tel:${(settings.phoneContact || '+34612345678').replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                    {settings.phoneContact || '+34 612 345 678'}
                  </a>
                </li>
              )}
              {settings.showAddress !== '0' && (
                <li>📍 {settings.address || 'Madrid, España'}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-400">
          <p>© {currentYear} Fundación Luz de Benín. {t(lang, 'footer.rights')}</p>
          <div className="flex gap-4">
            <Link href={`/${lang}/aviso-legal/`} className="hover:text-white transition-colors">{t(lang, 'footer.legal')}</Link>
            <Link href={`/${lang}/aviso-legal/#privacidad`} className="hover:text-white transition-colors">{t(lang, 'footer.privacy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
