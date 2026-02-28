import { Lang } from '@/lib/types';
import { api } from '@/lib/api';
import Hero from '@/components/home/Hero';
import MissionStrip from '@/components/home/MissionStrip';
import StatsCounter from '@/components/home/StatsCounter';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import LatestBlog from '@/components/home/LatestBlog';
import DonationCTA from '@/components/home/DonationCTA';

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;

  const [sections, projects, posts] = await Promise.allSettled([
    api.getPageSections('home'),
    api.getProjects({ featured: true }),
    api.getBlogPosts(),
  ]);

  const sec = sections.status === 'fulfilled' ? sections.value : {};
  const proj = projects.status === 'fulfilled' ? projects.value : [];
  const blog = posts.status === 'fulfilled' ? posts.value : [];

  const missionTitle = sec?.mission?.title ? (l === 'es' ? sec.mission.title.es : sec.mission.title.fr) : '';
  const missionText  = sec?.mission?.text  ? (l === 'es' ? sec.mission.text.es  : sec.mission.text.fr)  : '';

  return (
    <>
      <Hero lang={l} />
      <MissionStrip lang={l} title={missionTitle} text={missionText} />
      <StatsCounter lang={l} />
      <FeaturedProjects lang={l} projects={proj} />
      <LatestBlog lang={l} posts={blog} />
      <DonationCTA lang={l} />
    </>
  );
}
