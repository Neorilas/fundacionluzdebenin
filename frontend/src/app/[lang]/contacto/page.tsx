import type { Metadata } from 'next';
import { Lang, Settings, SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import ContactForm from '@/components/ui/ContactForm';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr ? 'Contact' : 'Contacto';
  const description = isFr
    ? "Contactez la Fondation Lumière du Bénin. Répondez à vos questions sur nos projets, le bénévolat ou les dons. Nous vous répondrons rapidement."
    : 'Contacta con la Fundación Luz de Benín. Resuelve tus dudas sobre proyectos, voluntariado o donaciones. Te responderemos lo antes posible.';
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/contacto/`,
      languages: {
        'es': `${SITE_URL}/es/contacto/`,
        'fr': `${SITE_URL}/fr/contacto/`,
        'x-default': `${SITE_URL}/es/contacto/`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}/${lang}/contacto/` },
  };
}

export default async function ContactoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const [sec, settings] = await Promise.all([
    api.getPageSections('contacto').catch(() => ({})),
    api.getSettings().catch(() => ({} as Settings)),
  ]);
  const get = (section: string, key: string) => {
    const s = (sec as Record<string, Record<string, { es: string; fr: string }>>)[section]?.[key];
    return s ? (l === 'es' ? s.es : s.fr) : '';
  };

  return (
    <div>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">{get('hero', 'title') || t(l, 'contact.title')}</h1>
          <p className="text-xl text-primary-100">{get('hero', 'subtitle') || t(l, 'contact.subtitle')}</p>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-5 gap-10">
          {/* Form */}
          <div className="md:col-span-3 bg-white rounded-2xl p-8 shadow-sm">
            <ContactForm lang={l} />
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
              <h3 className="font-bold text-primary-800 mb-4">{l === 'es' ? 'Información de contacto' : 'Informations de contact'}</h3>
              <div className="space-y-3 text-sm text-gray-700">
                {settings.showEmail !== '0' && (
                  <div className="flex items-start gap-3">
                    <span className="text-primary-800 text-lg">📧</span>
                    <div>
                      <p className="font-medium">{t(l, 'contact.info.email')}</p>
                      <a href={`mailto:${settings.emailContact || 'info@fundacionluzdebenin.org'}`} className="text-muted hover:text-primary-800 transition-colors">
                        {settings.emailContact || 'info@fundacionluzdebenin.org'}
                      </a>
                    </div>
                  </div>
                )}
                {settings.showPhone !== '0' && (
                  <div className="flex items-start gap-3">
                    <span className="text-primary-800 text-lg">📞</span>
                    <div>
                      <p className="font-medium">{t(l, 'contact.info.phone')}</p>
                      <a href={`tel:${(settings.phoneContact || '+34612345678').replace(/\s/g, '')}`} className="text-muted hover:text-primary-800 transition-colors">
                        {settings.phoneContact || '+34 612 345 678'}
                      </a>
                    </div>
                  </div>
                )}
                {settings.showAddress !== '0' && (
                  <div className="flex items-start gap-3">
                    <span className="text-primary-800 text-lg">📍</span>
                    <div>
                      <p className="font-medium">{t(l, 'contact.info.address')}</p>
                      <p className="text-muted">{settings.address || 'Madrid, España'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-4xl mb-3">🌍</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {l === 'es'
                  ? 'También puedes seguirnos en redes sociales para estar al día de nuestros proyectos.'
                  : 'Vous pouvez aussi nous suivre sur les réseaux sociaux pour vous tenir au courant de nos projets.'}
              </p>
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-primary-800 hover:text-accent font-medium">
                  Facebook →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
