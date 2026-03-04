import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/blog?page=1&limit=9
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 9, 50);
    const page  = Math.max(parseInt(req.query.page  as string) || 1, 1);
    const skip  = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where: { published: true } }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, slug: true, titleEs: true, titleFr: true,
          excerptEs: true, excerptFr: true, coverImage: true,
          publishedAt: true, createdAt: true,
        },
      }),
    ]);

    res.json({ posts, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/blog/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, published: true },
    });
    if (!post) {
      res.status(404).json({ error: 'Post no encontrado' });
      return;
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

export default router;
