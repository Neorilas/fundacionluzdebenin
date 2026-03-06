import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/faqs
router.get('/', async (_req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: 'asc' } });
    res.json(faqs);
  } catch (error) { next(error); }
});

// POST /api/admin/faqs
router.post('/', async (req, res, next) => {
  try {
    const { questionEs, questionFr, answerEs, answerFr, order, active } = req.body;
    const faq = await prisma.faq.create({
      data: {
        questionEs: questionEs || '',
        questionFr: questionFr || '',
        answerEs: answerEs || '',
        answerFr: answerFr || '',
        order: order ?? 0,
        active: active ?? true,
      },
    });
    res.status(201).json(faq);
  } catch (error) { next(error); }
});

// PUT /api/admin/faqs/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { questionEs, questionFr, answerEs, answerFr, order, active } = req.body;
    const faq = await prisma.faq.update({
      where: { id: req.params.id },
      data: {
        ...(questionEs !== undefined && { questionEs }),
        ...(questionFr !== undefined && { questionFr }),
        ...(answerEs !== undefined && { answerEs }),
        ...(answerFr !== undefined && { answerFr }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });
    res.json(faq);
  } catch (error) { next(error); }
});

// DELETE /api/admin/faqs/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.faq.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
