import type { Metadata } from 'next';
import { Lang, Settings, SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import NewsletterLanding from '@/components/newsletter/NewsletterLanding';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';

  const title = isFr
    ? 'Newsletter | Fondation Lumière du Bénin'
    : 'Newsletter | Fundación Luz de Benín';
  const description = isFr
    ? 'Abonnez-vous à notre newsletter et suivez nos projets au Bénin : orphelinats, ferme avicole et programme pour les jeunes mères.'
    : 'Suscríbete a nuestra newsletter y sigue de cerca nuestros proyectos en Benín: orfanatos, granja avícola y programa de madres jóvenes.';

  return {
    // Página no pública: accesible por enlace directo (WhatsApp) pero fuera del índice.
    robots: { index: false, follow: false },
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/suscribete/`,
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

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang as Lang;

  const settings: Settings = await api.getSettings().catch(() => ({} as Settings));
  const logoUrl = settings.logoUrl || '/logo.jpg';

  return <NewsletterLanding lang={l} logoUrl={logoUrl} />;
}
