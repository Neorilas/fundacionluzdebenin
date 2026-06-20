import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware';
import { isFullAdmin } from '../../lib/roles';

const router = Router();
router.use(authMiddleware);

const PAGE_SIZE = 20;

// GET /api/admin/donations
// - admin: historial completo con filtros (estado/tipo) y datos del producto.
// - donations_viewer: solo donaciones realizadas (completadas) con
//   nombre, email, DNI, importe y fecha.
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const fullAdmin = isFullAdmin(req.adminRole);

    const where: Record<string, unknown> = {};
    if (fullAdmin) {
      const status = req.query.status as string | undefined;
      const type = req.query.type as string | undefined;
      if (status) where.status = status;
      if (type) where.type = type;
    } else {
      // El visor solo ve donaciones efectivamente realizadas.
      where.status = 'completed';
    }

    const [total, rows] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: fullAdmin ? { stripeProduct: true } : undefined,
      }),
    ]);

    // Para el visor, exponer únicamente los campos permitidos.
    const data = fullAdmin
      ? rows
      : rows.map((d: typeof rows[0]) => ({
          id: d.id,
          donorName: d.donorName,
          donorEmail: d.donorEmail,
          donorDni: d.donorDni,
          amount: d.amount,
          currency: d.currency,
          createdAt: d.createdAt,
        }));

    res.json({
      data,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
