import type { Metadata } from 'next';
import { Lang, Settings } from '@/lib/types';
import { api } from '@/lib/api';
import ColaboraEmpresasClient from '@/components/colabora-empresas/ColaboraEmpresasClient';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr
    ? "Collaborer avec la Fondation — Entreprises et indépendants"
    : "Colabora con Fundación Luz de Benín — Empresas y autónomos";
  const description = isFr
    ? "Découvrez les avantages fiscaux de la collaboration avec une fondation à but non lucratif en Espagne. Déduction jusqu'à 50% sur l'impôt sur les sociétés."
    : "Descubre los beneficios fiscales de colaborar con una fundación sin ánimo de lucro. Deducción de hasta el 50% en el Impuesto sobre Sociedades. Impacto real en Benín.";

  return {
    title: { absolute: title },
    description,
    robots: { index: false },
    alternates: {
      canonical: `${SITE_URL}/${lang}/colabora-empresas/`,
      languages: {
        es: `${SITE_URL}/es/colabora-empresas/`,
        fr: `${SITE_URL}/fr/colabora-empresas/`,
        'x-default': `${SITE_URL}/es/colabora-empresas/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/colabora-empresas/`,
      images: [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 600, alt: title }],
    },
  };
}

export default async function ColaboraEmpresasPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang as Lang;

  const settings: Settings = await api.getSettings().catch(() => ({} as Settings));
  const heroImage = settings.colaboraEmpresasHeroImage || '';

  const heroTitle =
    l === 'es'
      ? "Colabora con nosotros."
      : "Collaborez avec nous.";
  const heroTitleAccent =
    l === 'es'
      ? "Tiene más sentido del que crees."
      : "Ça a plus de sens que vous ne le croyez.";
  const heroSubtitle =
    l === 'es'
      ? "Cada euro que inviertes en Fundación Luz de Benín trabaja dos veces: una en Hacienda, otra en África."
      : "Chaque euro investi dans la Fondation travaille deux fois : une fois pour le fisc, une fois pour l'Afrique.";
  const heroTag =
    l === 'es' ? "Empresas y autónomos" : "Entreprises et indépendants";

  return (
    <div>
      {/* Hero */}
      <section
        className="relative bg-primary-900 text-white py-20 overflow-hidden"
        style={
          heroImage
            ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
        }
      >
        <div className="absolute inset-0 bg-primary-900/80" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <p className="inline-block bg-white/10 border border-white/20 rounded-full text-xs uppercase tracking-widest font-semibold px-4 py-1.5 mb-6">
            {heroTag}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            {heroTitle}{' '}
            <span className="text-green-300">{heroTitleAccent}</span>
          </h1>
          <p className="text-lg text-primary-100 max-w-xl mx-auto">{heroSubtitle}</p>
        </div>
      </section>

      {/* Client: tabs, calculadora, secciones comunes, formulario */}
      <ColaboraEmpresasClient lang={l} />
    </div>
  );
}
