import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import ContactForm from '@/components/ui/ContactForm';

export const revalidate = 60;

export default async function ContactoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const settings = await api.getSettings().catch(() => ({}));

  return (
    <div>
      <section className="bg-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4">{t(l, 'contact.title')}</h1>
          <p className="text-xl text-primary-100">{t(l, 'contact.subtitle')}</p>
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
                <div className="flex items-start gap-3">
                  <span className="text-primary-800 text-lg">📧</span>
                  <div>
                    <p className="font-medium">{t(l, 'contact.info.email')}</p>
                    <p className="text-muted">{settings.emailContact || 'info@fundacionluzdebenin.org'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-800 text-lg">📞</span>
                  <div>
                    <p className="font-medium">{t(l, 'contact.info.phone')}</p>
                    <p className="text-muted">{settings.phoneContact || '+34 612 345 678'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-800 text-lg">📍</span>
                  <div>
                    <p className="font-medium">{t(l, 'contact.info.address')}</p>
                    <p className="text-muted">{settings.address || 'Madrid, España'}</p>
                  </div>
                </div>
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
