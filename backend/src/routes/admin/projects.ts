import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

const parseProject = (p: { images: string; stats: string; [key: string]: unknown }) => ({
  ...p,
  images: JSON.parse(p.images || '[]'),
  stats: JSON.parse(p.stats || '{}'),
});

// GET /api/admin/projects
router.get('/', async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(projects.map(parseProject));
  } catch (error) { next(error); }
});

// POST /api/admin/projects
router.post('/', async (req, res, next) => {
  try {
    const { slug, titleEs, titleFr, descEs, descFr, status, featured, images, stats, order } = req.body;
    const project = await prisma.project.create({
      data: {
        slug, titleEs, titleFr, descEs, descFr,
        status: status || 'active',
        featured: featured || false,
        images: JSON.stringify(images || []),
        stats: JSON.stringify(stats || {}),
        order: order !== undefined ? parseInt(order, 10) : 0,
      },
    });
    res.status(201).json(parseProject(project));
  } catch (error) { next(error); }
});

// PUT /api/admin/projects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { slug, titleEs, titleFr, descEs, descFr, status, featured, images, stats, order } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(slug && { slug }),
        ...(titleEs && { titleEs }),
        ...(titleFr && { titleFr }),
        ...(descEs !== undefined && { descEs }),
        ...(descFr !== undefined && { descFr }),
        ...(status && { status }),
        ...(featured !== undefined && { featured }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(stats !== undefined && { stats: JSON.stringify(stats) }),
        ...(order !== undefined && { order: parseInt(order, 10) }),
      },
    });
    res.json(parseProject(project));
  } catch (error) { next(error); }
});

// DELETE /api/admin/projects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
