import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/pages
router.get('/', async (_req, res, next) => {
  try {
    const sections = await prisma.pageSection.findMany({
      orderBy: [{ page: 'asc' }, { section: 'asc' }],
    });
    res.json(sections);
  } catch (error) { next(error); }
});

// GET /api/admin/pages/:page
router.get('/:page', async (req, res, next) => {
  try {
    const sections = await prisma.pageSection.findMany({
      where: { page: req.params.page },
    });
    res.json(sections);
  } catch (error) { next(error); }
});

// PUT /api/admin/pages/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { valueEs, valueFr } = req.body;
    const section = await prisma.pageSection.update({
      where: { id: req.params.id },
      data: { valueEs, valueFr },
    });
    res.json(section);
  } catch (error) { next(error); }
});

export default router;
