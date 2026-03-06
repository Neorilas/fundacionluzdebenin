import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/faqs
router.get('/', async (_req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, questionEs: true, questionFr: true, answerEs: true, answerFr: true, order: true },
    });
    res.json(faqs);
  } catch (error) { next(error); }
});

export default router;
