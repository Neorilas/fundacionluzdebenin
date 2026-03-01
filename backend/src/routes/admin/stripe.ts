import { Router, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../../lib/prisma';
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

// GET /api/admin/stripe/products
router.get('/products', async (_req: AuthRequest, res: Response, next) => {
  try {
    const products = await prisma.stripeProduct.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/stripe/products
router.post('/products', async (req: AuthRequest, res: Response, next) => {
  try {
    const { nameEs, nameFr, descEs, descFr, amount, interval, order } = req.body as {
      nameEs: string;
      nameFr: string;
      descEs?: string;
      descFr?: string;
      amount: number;
      interval: 'month' | 'year';
      order?: number;
    };

    if (!nameEs || !nameFr || !amount || amount < 100) {
      res.status(400).json({ error: 'Nombre (ES/FR) e importe mínimo 1€ requeridos' });
      return;
    }

    if (!['month', 'year'].includes(interval)) {
      res.status(400).json({ error: 'Intervalo inválido (month o year)' });
      return;
    }

    // Create in Stripe
    const stripeProduct = await stripe.products.create({ name: nameEs });
    const stripePrice = await stripe.prices.create({
      unit_amount: amount,
      currency: 'eur',
      recurring: { interval },
      product: stripeProduct.id,
    });

    // Save in DB
    const product = await prisma.stripeProduct.create({
      data: {
        nameEs,
        nameFr,
        descEs: descEs || '',
        descFr: descFr || '',
        amount,
        interval,
        order: order ?? 0,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/stripe/products/:id
router.put('/products/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { nameEs, nameFr, descEs, descFr, order, active } = req.body as {
      nameEs?: string;
      nameFr?: string;
      descEs?: string;
      descFr?: string;
      order?: number;
      active?: boolean;
    };

    const existing = await prisma.stripeProduct.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const product = await prisma.stripeProduct.update({
      where: { id },
      data: {
        ...(nameEs !== undefined && { nameEs }),
        ...(nameFr !== undefined && { nameFr }),
        ...(descEs !== undefined && { descEs }),
        ...(descFr !== undefined && { descFr }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/stripe/products/:id — archives, never deletes
router.delete('/products/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.stripeProduct.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    // Archive in Stripe if we have the ID
    if (existing.stripeProductId) {
      await stripe.products.update(existing.stripeProductId, { active: false }).catch(console.error);
    }

    const product = await prisma.stripeProduct.update({
      where: { id },
      data: { active: false },
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stripe/donations
router.get('/donations', async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 20;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [total, donations] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { stripeProduct: true },
      }),
    ]);

    res.json({
      data: donations,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
