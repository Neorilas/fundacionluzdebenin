import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../../lib/prisma';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// GET /api/stripe/products
router.get('/products', async (_req: Request, res: Response, next) => {
  try {
    const products = await prisma.stripeProduct.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/stripe/checkout
router.post('/checkout', async (req: Request, res: Response, next) => {
  try {
    const { type, amount, stripeProductId, donorName, donorEmail, donorDni, lang } = req.body as {
      type: 'one_time' | 'subscription';
      amount?: number;
      stripeProductId?: string;
      donorName?: string;
      donorEmail?: string;
      donorDni?: string;
      lang: 'es' | 'fr';
    };

    if (!type || !['one_time', 'subscription'].includes(type)) {
      res.status(400).json({ error: 'Tipo de donación inválido' });
      return;
    }

    if (!lang || !['es', 'fr'].includes(lang)) {
      res.status(400).json({ error: 'Idioma inválido' });
      return;
    }

    let finalAmount: number;
    let product: Awaited<ReturnType<typeof prisma.stripeProduct.findUnique>> | null = null;

    if (type === 'one_time') {
      if (!amount || amount < 100) {
        res.status(400).json({ error: 'Importe mínimo: 1€ (100 céntimos)' });
        return;
      }
      finalAmount = amount;
    } else {
      // Subscription: either a named product or a custom amount
      if (stripeProductId) {
        product = await prisma.stripeProduct.findUnique({ where: { id: stripeProductId } });
        if (!product || !product.active) {
          res.status(404).json({ error: 'Producto no encontrado o inactivo' });
          return;
        }
        if (!product.stripePriceId) {
          res.status(400).json({ error: 'Producto no tiene precio de Stripe configurado' });
          return;
        }
        finalAmount = product.amount;
      } else {
        // Custom subscription amount (no named product)
        if (!amount || amount < 100) {
          res.status(400).json({ error: 'Importe mínimo para suscripción: 1€ (100 céntimos)' });
          return;
        }
        finalAmount = amount;
      }
    }

    // Create Donation record
    const donation = await prisma.donation.create({
      data: {
        type,
        status: 'pending',
        amount: finalAmount,
        currency: 'eur',
        donorName: donorName || null,
        donorEmail: donorEmail || null,
        donorDni: donorDni || null,
        stripeProductId: product?.id || null,
      },
    });

    // Build Stripe session params
    const successUrl = `${FRONTEND_URL}/${lang}/colabora/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${FRONTEND_URL}/${lang}/colabora/cancel`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: type === 'one_time' ? 'payment' : 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: lang === 'es' ? 'es' : 'fr',
      metadata: {
        donationId: donation.id,
        donorDni: donorDni || '',
      },
    };

    // Only set customer_email if it's a valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (donorEmail && emailRegex.test(donorEmail)) {
      sessionParams.customer_email = donorEmail;
    }

    if (type === 'one_time') {
      sessionParams.line_items = [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: finalAmount,
            product_data: {
              name: lang === 'es' ? 'Donación única — Fundación Luz de Benín' : 'Don unique — Fondation Luz de Benín',
            },
          },
        },
      ];
    } else if (product?.stripePriceId) {
      // Named product with pre-existing Stripe price
      sessionParams.line_items = [
        {
          quantity: 1,
          price: product.stripePriceId,
        },
      ];
    } else {
      // Custom subscription amount — create price inline
      sessionParams.line_items = [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: finalAmount,
            recurring: { interval: 'month' },
            product_data: {
              name: lang === 'es' ? 'Donación mensual — Fundación Luz de Benín' : 'Don mensuel — Fondation Luz de Benín',
            },
          },
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Save session ID
    await prisma.donation.update({
      where: { id: donation.id },
      data: { stripeSessionId: session.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('❌ Stripe error:', err.message);
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
});

export default router;
