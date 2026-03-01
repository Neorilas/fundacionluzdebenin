import Link from 'next/link';
import { Lang } from '@/lib/types';

export const revalidate = 0;

const LABELS: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Donación no procesada',
    text: 'No se ha realizado ningún cargo. Puedes intentarlo cuando quieras.',
    back: 'Volver a la página de donaciones',
  },
  fr: {
    title: 'Don non traité',
    text: 'Aucun montant n\'a été débité. Vous pouvez réessayer quand vous le souhaitez.',
    back: 'Retour à la page des dons',
  },
};

export default async function CancelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const L = LABELS[l] || LABELS.es;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="text-7xl mb-6">↩️</div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{L.title}</h1>
        <p className="text-gray-600 mb-8">{L.text}</p>
        <Link
          href={`/${l}/colabora`}
          className="bg-primary-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-900 transition-colors"
        >
          {L.back}
        </Link>
      </div>
    </div>
  );
}
