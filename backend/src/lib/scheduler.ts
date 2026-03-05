import prisma from './prisma';

export function startScheduler(): void {
  setInterval(async () => {
    try {
      await prisma.blogPost.updateMany({
        where: {
          published: false,
          scheduledAt: { lte: new Date() },
        },
        data: { published: true, publishedAt: new Date() },
      });
    } catch {
      // Non-critical — scheduler errors don't affect the server
    }
  }, 60 * 1000); // Check every minute
}
