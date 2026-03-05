import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FAFAFA]">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🌍</div>
        <h1 className="text-7xl font-extrabold text-[#065F46] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Página no encontrada</h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Esta página no existe o ha sido movida. Puedes volver al inicio o contactar con nosotros.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/es/"
            className="bg-[#065F46] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#044034] transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/es/contacto/"
            className="border-2 border-[#065F46] text-[#065F46] px-8 py-3 rounded-full font-semibold hover:bg-[#065F46]/5 transition-colors"
          >
            Contactar
          </Link>
        </div>
      </div>
    </div>
  );
}
