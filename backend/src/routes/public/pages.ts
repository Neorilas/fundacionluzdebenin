import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/pages/:page
router.get('/:page', async (req, res, next) => {
  try {
    const sections = await prisma.pageSection.findMany({
      where: { page: req.params.page },
    });

    // Organize by section
    const organized: Record<string, Record<string, { es: string; fr: string }>> = {};
    for (const s of sections) {
      if (!organized[s.section]) organized[s.section] = {};
      organized[s.section][s.key] = { es: s.valueEs, fr: s.valueFr };
    }

    res.json(organized);
  } catch (error) {
    next(error);
  }
});

export default router;
