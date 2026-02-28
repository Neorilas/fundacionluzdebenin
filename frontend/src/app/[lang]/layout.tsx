import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { isValidLang } from '@/lib/i18n';
import { Lang } from '@/lib/types';

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'fr' }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'fr' ? 'Fondation Lumière du Bénin' : 'Fundación Luz de Benín',
    description: lang === 'fr'
      ? 'ONG espagnole de coopération au développement au Bénin, Afrique de l\'Ouest.'
      : 'ONG española de cooperación al desarrollo en Benín, África Occidental.',
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
