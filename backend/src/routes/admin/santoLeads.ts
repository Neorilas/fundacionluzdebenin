import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/santo-leads — list all leads
router.get('/', async (_req, res, next) => {
  try {
    const leads = await prisma.santoLead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ total: leads.length, leads });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/santo-leads/export.csv — download as CSV
router.get('/export.csv', async (_req, res, next) => {
  try {
    const leads = await prisma.santoLead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const header = 'email,nombre,santo,acepta_comunicaciones,lang,fecha';
    const rows = leads.map((l) =>
      [
        `"${l.email}"`,
        `"${l.nombre}"`,
        `"${l.santoNombre}"`,
        l.aceptaComunicaciones ? 'si' : 'no',
        l.lang,
        l.createdAt.toISOString().slice(0, 10),
      ].join(',')
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="santo-leads.csv"');
    res.send('\uFEFF' + [header, ...rows].join('\n')); // BOM para Excel
  } catch (error) {
    next(error);
  }
});

export default router;
