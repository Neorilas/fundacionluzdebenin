import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr ? 'Nos Projets au Bénin' : 'Nuestros Proyectos en Benín';
  const description = isFr
    ? "Découvrez tous les projets de la Fondation Lumière du Bénin : soutien aux orphelinats, accompagnement des mères célibataires, ferme avicole et projets de développement rural."
    : 'Conoce todos los proyectos de la Fundación Luz de Benín: apoyo a orfanatos, acompañamiento a madres solteras, granja avícola y proyectos de desarrollo rural.';
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/proyectos/`,
      languages: {
        'es': `${SITE_URL}/es/proyectos/`,
        'fr': `${SITE_URL}/fr/proyectos/`,
        'x-default': `${SITE_URL}/es/proyectos/`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}/${lang}/proyectos/` },
  };
}

export default function ProyectosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
