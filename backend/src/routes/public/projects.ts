import { Router } from 'express';
import prisma from '../../lib/prisma';
import { buildPublicProjectWhere, isPubliclyVisible } from '../../lib/projectVisibility';

const router = Router();

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const where = buildPublicProjectWhere(req.query);

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    const parsed = projects.map((p: typeof projects[0]) => ({
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
    if (!isPubliclyVisible(project)) {
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
