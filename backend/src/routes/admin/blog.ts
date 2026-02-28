import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/blog
router.get('/', async (_req, res, next) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) { next(error); }
});

// GET /api/admin/blog/:id
router.get('/:id', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ error: 'Post no encontrado' }); return; }
    res.json(post);
  } catch (error) { next(error); }
});

// POST /api/admin/blog
router.post('/', async (req, res, next) => {
  try {
    const { slug, titleEs, titleFr, excerptEs, excerptFr, contentEs, contentFr, coverImage, published } = req.body;
    const post = await prisma.blogPost.create({
      data: {
        slug, titleEs, titleFr, excerptEs, excerptFr, contentEs, contentFr,
        coverImage: coverImage || '',
        published: published || false,
        publishedAt: published ? new Date() : null,
      },
    });
    res.status(201).json(post);
  } catch (error) { next(error); }
});

// PUT /api/admin/blog/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { slug, titleEs, titleFr, excerptEs, excerptFr, contentEs, contentFr, coverImage, published } = req.body;
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        ...(slug && { slug }),
        ...(titleEs !== undefined && { titleEs }),
        ...(titleFr !== undefined && { titleFr }),
        ...(excerptEs !== undefined && { excerptEs }),
        ...(excerptFr !== undefined && { excerptFr }),
        ...(contentEs !== undefined && { contentEs }),
        ...(contentFr !== undefined && { contentFr }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && {
          published,
          publishedAt: published && !existing?.publishedAt ? new Date() : existing?.publishedAt,
        }),
      },
    });
    res.json(post);
  } catch (error) { next(error); }
});

// DELETE /api/admin/blog/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
