import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Página no encontrada',
  robots: 'noindex',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FAFAFA]">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🌍</div>
        <h1 className="text-7xl font-extrabold text-[#065F46] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Pagina no encontrada · Page introuvable
        </h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Esta pagina no existe o ha sido movida.<br />
          Cette page n&apos;existe pas ou a ete deplacee.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/es/"
            className="bg-[#065F46] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#044034] transition-colors"
          >
            Inicio / Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
