import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Lang } from '@/lib/types';
import TuSantoClient from '@/components/tu-santo/TuSantoClient';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';

  const title = isFr
    ? 'Ton Saint Missionnaire en Afrique | Fondation Lumière du Bénin'
    : 'Tu Santo Misionero en África | Fundación Luz de Benín';
  const description = isFr
    ? "Découvre quel saint missionnaire t'accompagne cette année dans la mission au Bénin. Asignation providentialle basée sur ton email. Partage avec tes amis."
    : 'Descubre qué santo misionero te acompaña este año en la misión de Benín. Asignación providencial única. Compártelo con tus amigos y familiares.';

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/tu-santo/`,
      languages: {
        es: `${SITE_URL}/es/tu-santo/`,
        fr: `${SITE_URL}/fr/tu-santo/`,
        'x-default': `${SITE_URL}/es/tu-santo/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/tu-santo/`,
      images: [
        {
          url: `${SITE_URL}/logo.jpg`,
          width: 800,
          height: 600,
          alt: isFr ? 'Fondation Lumière du Bénin' : 'Fundación Luz de Benín',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/logo.jpg`],
    },
  };
}

export default async function TuSantoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang as Lang;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <span className="text-6xl animate-pulse">🕯️</span>
        </div>
      }
    >
      <TuSantoClient lang={l} />
    </Suspense>
  );
}
