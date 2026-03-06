import prisma from './prisma';
import { revalidate, PATHS } from './revalidate';

export function startScheduler(): void {
  setInterval(async () => {
    try {
      // Find posts due to publish before updating, so we can revalidate them
      const due = await prisma.blogPost.findMany({
        where: { published: false, scheduledAt: { lte: new Date() } },
        select: { slug: true },
      });

      if (due.length === 0) return;

      await prisma.blogPost.updateMany({
        where: { published: false, scheduledAt: { lte: new Date() } },
        data: { published: true, publishedAt: new Date() },
      });

      // Revalidate frontend pages for each published post
      for (const post of due) {
        revalidate(PATHS.blogPost(post.slug));
      }
    } catch {
      // Non-critical — scheduler errors don't affect the server
    }
  }, 60 * 1000); // Check every minute
}
