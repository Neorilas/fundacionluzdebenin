import { Router } from 'express';
import { BlogPost } from '@prisma/client';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';
import { revalidate, PATHS } from '../../lib/revalidate';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/blog
router.get('/', async (_req, res, next) => {
  try {
    const raw = await prisma.blogPost.findMany();
    // Sort: published first (desc publishedAt) → scheduled ASC (soonest next) → drafts (desc createdAt)
    raw.sort((a: BlogPost, b: BlogPost) => {
      if (a.published && b.published)
        return new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime();
      if (a.published) return -1;
      if (b.published) return 1;
      if (a.scheduledAt && b.scheduledAt)
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      if (a.scheduledAt) return -1;
      if (b.scheduledAt) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.json(raw);
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
    const { slug, titleEs, titleFr, metaTitleEs, metaTitleFr, excerptEs, excerptFr,
            contentEs, contentFr, coverImage, coverImageAlt, category, tags,
            focusKeyword, published, scheduledAt } = req.body;

    const isScheduled = !published && scheduledAt;
    const post = await prisma.blogPost.create({
      data: {
        slug, titleEs, titleFr,
        metaTitleEs: metaTitleEs || '', metaTitleFr: metaTitleFr || '',
        excerptEs: excerptEs || '', excerptFr: excerptFr || '',
        contentEs: contentEs || '', contentFr: contentFr || '',
        coverImage: coverImage || '', coverImageAlt: coverImageAlt || '',
        category: category || '',
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]'),
        focusKeyword: focusKeyword || '',
        published: published || false,
        publishedAt: published ? new Date() : null,
        scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      },
    });
    revalidate(PATHS.blogPost(post.slug));
    res.status(201).json(post);
  } catch (error) { next(error); }
});

// PUT /api/admin/blog/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { slug, titleEs, titleFr, metaTitleEs, metaTitleFr, excerptEs, excerptFr,
            contentEs, contentFr, coverImage, coverImageAlt, category, tags,
            focusKeyword, published, scheduledAt } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    const isScheduled = !published && scheduledAt;

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
        ...(coverImageAlt !== undefined && { coverImageAlt }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? JSON.stringify(tags) : tags }),
        ...(metaTitleEs !== undefined && { metaTitleEs }),
        ...(metaTitleFr !== undefined && { metaTitleFr }),
        ...(focusKeyword !== undefined && { focusKeyword }),
        ...(published !== undefined && {
          published,
          publishedAt: published && !existing?.publishedAt ? new Date() : existing?.publishedAt,
        }),
        scheduledAt: isScheduled ? new Date(scheduledAt) : (published ? null : (scheduledAt === null ? null : existing?.scheduledAt)),
      },
    });
    revalidate(PATHS.blogPost(post.slug));
    res.json(post);
  } catch (error) { next(error); }
});

// GET /api/admin/blog/:id/preview-url
router.get('/:id/preview-url', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id }, select: { slug: true } });
    if (!post) { res.status(404).json({ error: 'Post no encontrado' }); return; }
    const PREVIEW_SECRET = process.env.PREVIEW_SECRET || 'preview-luz-benin';
    const FRONTEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    res.json({
      es: `${FRONTEND_URL}/es/blog/${post.slug}/?preview=${PREVIEW_SECRET}`,
      fr: `${FRONTEND_URL}/fr/blog/${post.slug}/?preview=${PREVIEW_SECRET}`,
    });
  } catch (error) { next(error); }
});

// DELETE /api/admin/blog/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.delete({ where: { id: req.params.id } });
    revalidate(PATHS.blogPost(post.slug));
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
