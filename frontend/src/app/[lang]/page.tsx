import type { Metadata } from 'next';
import { Lang, PageSections, SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import Hero from '@/components/home/Hero';
import MissionStrip from '@/components/home/MissionStrip';
import StatsCounter from '@/components/home/StatsCounter';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import LatestBlog from '@/components/home/LatestBlog';
import DonationCTA from '@/components/home/DonationCTA';
import CampaignsStrip from '@/components/home/CampaignsStrip';
import NewsletterStrip from '@/components/home/NewsletterStrip';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';

  const title = isFr
    ? 'Fondation Lumière du Bénin – Aide aux orphelinats au Bénin'
    : 'Fundación Luz de Benín – Ayuda a orfanatos en Benín';
  const description = isFr
    ? "Nous soutenons 4 orphelinats au Bénin grâce à notre ferme avicole de 2 500 poules, la formation de mères célibataires et le développement durable."
    : 'Apoyamos 4 orfanatos en Benín con nuestra granja avícola de 2.500 gallinas, formación para madres solteras y proyectos de desarrollo sostenible.';

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

  const sec: PageSections = sections.status === 'fulfilled' ? sections.value : {};
  const proj = projects.status === 'fulfilled' ? projects.value : [];
  const blog = posts.status === 'fulfilled' ? posts.value.posts : [];
  const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value : [];
  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : {};
  const logoUrl = (settings as { logoUrl?: string }).logoUrl || '/logo.jpg';

  const organizationId = `${SITE_URL}/#organization`;
  const organizationLd = {
    '@type': 'Organization',
    '@id': organizationId,
    name: 'Fundación Luz de Benín',
    alternateName: 'Fondation Lumière du Bénin',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.jpg`,
    image: `${SITE_URL}/logo.jpg`,
    description: 'Fundación española de cooperación al desarrollo en Benín, África Occidental. Apoyamos orfanatos, madres solteras y economía sostenible desde 2012.',
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

  const websiteLd = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: l === 'fr' ? 'Fondation Lumière du Bénin' : 'Fundación Luz de Benín',
    alternateName: l === 'fr' ? 'Fundación Luz de Benín' : 'Fondation Lumière du Bénin',
    inLanguage: ['es-ES', 'fr-FR'],
    publisher: { '@id': organizationId },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [organizationLd, websiteLd],
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
