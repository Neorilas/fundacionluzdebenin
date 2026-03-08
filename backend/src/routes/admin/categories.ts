import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

function toSlug(text: string): string {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/admin/blog-categories
router.get('/', async (_req, res, next) => {
  try {
    const cats = await prisma.blogCategory.findMany({ orderBy: { order: 'asc' } });
    res.json(cats);
  } catch (e) { next(e); }
});

// POST /api/admin/blog-categories
router.post('/', async (req, res, next) => {
  try {
    const { name, order = 0 } = req.body;
    const slug = toSlug(name);
    const cat = await prisma.blogCategory.create({ data: { name, slug, order } });
    res.status(201).json(cat);
  } catch (e) { next(e); }
});

// PUT /api/admin/blog-categories/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, order } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) { data.name = name; data.slug = toSlug(name); }
    if (order !== undefined) data.order = order;
    const cat = await prisma.blogCategory.update({ where: { id: req.params.id }, data });
    res.json(cat);
  } catch (e) { next(e); }
});

// DELETE /api/admin/blog-categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.blogCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
