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

  return (
    <>
      <Hero lang={l} sec={sec} />
      <MissionStrip lang={l} sec={sec} />
      <StatsCounter lang={l} sec={sec} />
      <FeaturedProjects lang={l} projects={proj} />
      <LatestBlog lang={l} posts={blog} />
      <DonationCTA lang={l} sec={sec} />
    </>
  );
}
