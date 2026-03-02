import Link from 'next/link';
import { Lang } from '@/lib/types';
import NewsletterInline from '@/components/ui/NewsletterInline';

export const revalidate = 0;

const LABELS: Record<Lang, Record<string, string>> = {
  es: {
    title: '¡Gracias por tu donación!',
    text: 'Tu donación contribuirá directamente a nuestros proyectos en Benín.',
    emailNote: 'Recibirás una confirmación por email de Stripe.',
    certificateNote: 'Si facilitaste tu DNI/NIF, generaremos tu certificado fiscal anual (Ley 49/2002).',
    backHome: 'Volver a inicio',
    seeProjects: 'Ver proyectos',
  },
  fr: {
    title: 'Merci pour votre don !',
    text: 'Votre don contribuera directement à nos projets au Bénin.',
    emailNote: 'Vous recevrez une confirmation par email de Stripe.',
    certificateNote: 'Si vous avez fourni votre NIE/NIF, nous générerons votre certificat fiscal annuel.',
    backHome: 'Retour à l\'accueil',
    seeProjects: 'Voir les projets',
  },
};

export default async function SuccessPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const L = LABELS[l] || LABELS.es;

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="text-3xl font-extrabold text-primary-900 mb-4">{L.title}</h1>
        <p className="text-gray-700 mb-3">{L.text}</p>
        <p className="text-sm text-gray-500 mb-2">{L.emailNote}</p>
        <p className="text-sm text-gray-500 mb-8">{L.certificateNote}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${l}`}
            className="bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-900 transition-colors"
          >
            {L.backHome}
          </Link>
          <Link
            href={`/${l}/proyectos`}
            className="border border-primary-800 text-primary-800 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
          >
            {L.seeProjects}
          </Link>
        </div>
        <NewsletterInline lang={l} />
      </div>
    </div>
  );
}
