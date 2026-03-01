import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { isValidLang } from '@/lib/i18n';
import { Lang } from '@/lib/types';

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'fr' }];
}

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const siteName = isFr ? 'Fondation Lumière du Bénin' : 'Fundación Luz de Benín';
  const description = isFr
    ? "ONG espagnole de coopération au développement au Bénin. Nous soutenons des orphelinats, des mères célibataires et l'économie durable en Afrique de l'Ouest."
    : 'ONG española de cooperación al desarrollo en Benín. Apoyamos orfanatos, madres solteras y economía sostenible en África Occidental.';

  return {
    title: {
      template: isFr ? `%s | ${siteName}` : `%s | ${siteName}`,
      default: siteName,
    },
    description,
    openGraph: {
      type: 'website',
      locale: isFr ? 'fr_FR' : 'es_ES',
      siteName,
      description,
      images: [{ url: '/logo.jpg', width: 800, height: 600, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/logo.jpg'],
    },
    alternates: {
      languages: {
        'es': `${SITE_URL}/es/`,
        'fr': `${SITE_URL}/fr/`,
        'x-default': `${SITE_URL}/es/`,
      },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  return (
    <div lang={lang}>
      <Header lang={lang as Lang} />
      <main>{children}</main>
      <Footer lang={lang as Lang} />
    </div>
  );
}
