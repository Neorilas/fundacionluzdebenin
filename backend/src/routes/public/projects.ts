import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const { status, featured } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (featured === 'true') where.featured = true;

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    const parsed = projects.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      stats: JSON.parse(p.stats || '{}'),
    }));

    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
    });
    if (!project) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }
    res.json({
      ...project,
      images: JSON.parse(project.images || '[]'),
      stats: JSON.parse(project.stats || '{}'),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
