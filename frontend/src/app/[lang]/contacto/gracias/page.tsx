import type { Metadata } from 'next';
import Link from 'next/link';
import { Lang } from '@/lib/types';

export const metadata: Metadata = { robots: 'noindex' };

export default async function GraciasPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const es = l === 'es';

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-bg px-4">
      <div className="max-w-lg w-full text-center py-20">
        <div className="text-7xl mb-6">💚</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          {es ? '¡Mensaje enviado!' : 'Message envoyé !'}
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {es
            ? 'Gracias por ponerte en contacto con nosotros. Te responderemos lo antes posible, normalmente en menos de 48 horas.'
            : 'Merci de nous avoir contactés. Nous vous répondrons dans les meilleurs délais, généralement sous 48 heures.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${l}/`}
            className="inline-flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            {es ? '← Volver al inicio' : '← Retour à l\'accueil'}
          </Link>
          <Link
            href={`/${l}/colabora/`}
            className="inline-flex items-center justify-center gap-2 border border-primary-800 text-primary-800 hover:bg-primary-50 font-semibold px-6 py-3 rounded-full transition-colors"
          >
            {es ? 'Apoya nuestra misión ❤️' : 'Soutenir notre mission ❤️'}
          </Link>
        </div>
      </div>
    </div>
  );
}
