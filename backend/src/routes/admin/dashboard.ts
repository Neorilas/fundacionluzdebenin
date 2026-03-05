import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      projectsCount,
      postsCount,
      unreadCount,
      scheduledPosts,
      recentContacts,
      monthlyDonations,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.blogPost.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.blogPost.findMany({
        where: { published: false, scheduledAt: { not: null, gte: now } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
        select: { id: true, titleEs: true, scheduledAt: true },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, subject: true, read: true, createdAt: true },
      }),
      prisma.donation.aggregate({
        where: { status: 'completed', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    res.json({
      stats: { projectsCount, postsCount, unreadCount },
      scheduledPosts,
      recentContacts,
      monthlyDonations: {
        total: monthlyDonations._sum.amount || 0,
        count: monthlyDonations._count,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
