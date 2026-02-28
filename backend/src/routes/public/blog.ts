import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/blog
router.get('/', async (_req, res, next) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, slug: true, titleEs: true, titleFr: true,
        excerptEs: true, excerptFr: true, coverImage: true,
        publishedAt: true, createdAt: true,
      },
    });
    res.json(posts);
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
