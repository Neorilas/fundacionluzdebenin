import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/subscribers
router.get('/', async (req, res, next) => {
  try {
    const { source, lang, active } = req.query;
    const where: Record<string, unknown> = {};
    if (source) where.source = source;
    if (lang) where.lang = lang;
    if (active !== undefined) where.active = active === 'true';

    const subscribers = await prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ total: subscribers.length, subscribers });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/subscribers/:id/unsubscribe
router.put('/:id/unsubscribe', async (req, res, next) => {
  try {
    await prisma.subscriber.update({
      where: { id: req.params.id },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/subscribers/export.csv
router.get('/export.csv', async (req, res, next) => {
  try {
    const { source, active } = req.query;
    const where: Record<string, unknown> = {};
    if (source) where.source = source;
    if (active !== undefined) where.active = active === 'true';

    const subscribers = await prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const header = 'email,nombre,lang,source,activo,fecha';
    const rows = subscribers.map((s) =>
      [
        `"${s.email}"`,
        `"${s.nombre}"`,
        s.lang,
        s.source,
        s.active ? 'si' : 'no',
        s.createdAt.toISOString().slice(0, 10),
      ].join(',')
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.send('\uFEFF' + [header, ...rows].join('\n'));
  } catch (error) {
    next(error);
  }
});

export default router;
