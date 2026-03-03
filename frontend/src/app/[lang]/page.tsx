import type { Metadata } from 'next';
import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import Hero from '@/components/home/Hero';
import MissionStrip from '@/components/home/MissionStrip';
import StatsCounter from '@/components/home/StatsCounter';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import LatestBlog from '@/components/home/LatestBlog';
import DonationCTA from '@/components/home/DonationCTA';
import CampaignsStrip from '@/components/home/CampaignsStrip';
import NewsletterStrip from '@/components/home/NewsletterStrip';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';

  const title = isFr
    ? 'Fondation Lumière du Bénin – ONG au Bénin, Afrique de l\'Ouest'
    : 'Fundación Luz de Benín – ONG en Benín, África Occidental';
  const description = isFr
    ? "Nous soutenons 4 orphelinats au Bénin grâce à notre ferme avicole de 2 500 poules. Projets d'éducation, d'accompagnement de mères célibataires et de développement économique durable."
    : 'Apoyamos 4 orfanatos en Benín con nuestra granja avícola de 2.500 gallinas. Proyectos de educación, acompañamiento a madres solteras y desarrollo económico sostenible.';

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/`,
      languages: {
        'es': `${SITE_URL}/es/`,
        'fr': `${SITE_URL}/fr/`,
        'x-default': `${SITE_URL}/es/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/`,
      images: [{ url: '/logo.jpg', width: 800, height: 600, alt: title }],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;

  const [sections, projects, posts, campaignsResult, settingsResult] = await Promise.allSettled([
    api.getPageSections('home'),
    api.getProjects({ featured: true }),
    api.getBlogPosts(),
    api.getCampaigns(),
    api.getSettings(),
  ]);

  const sec = sections.status === 'fulfilled' ? sections.value : {};
  const proj = projects.status === 'fulfilled' ? projects.value : [];
  const blog = posts.status === 'fulfilled' ? posts.value : [];
  const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value : [];
  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : {};
  const logoUrl = (settings as { logoUrl?: string }).logoUrl || '/logo.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Fundación Luz de Benín',
    alternateName: 'Fondation Lumière du Bénin',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
    image: `${SITE_URL}/logo.jpg`,
    description: 'ONG española de cooperación al desarrollo en Benín, África Occidental. Apoyamos orfanatos, madres solteras y economía sostenible desde 2012.',
    foundingDate: '2012',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Madrid',
      addressCountry: 'ES',
    },
    areaServed: { '@type': 'Country', name: 'Benin' },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'info@fundacionluzdebenin.org',
    },
    sameAs: [
      'https://www.facebook.com/fundacionluzdebenin',
      'https://www.instagram.com/fundacionluzdebenin',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero lang={l} sec={sec} logoUrl={logoUrl} />
      <MissionStrip lang={l} sec={sec} />
      <StatsCounter lang={l} sec={sec} />
      <CampaignsStrip lang={l} campaigns={campaigns} />
      <FeaturedProjects lang={l} projects={proj} />
      <LatestBlog lang={l} posts={blog} />
      <DonationCTA lang={l} sec={sec} />
      <NewsletterStrip lang={l} />
    </>
  );
}
