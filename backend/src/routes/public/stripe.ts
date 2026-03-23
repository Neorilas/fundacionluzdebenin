import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../../lib/prisma';

const router = Router();

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  }
  return _stripe;
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Rate limit: max 5 checkout attempts per IP per 10 minutes
const checkoutRateMap = new Map<string, number[]>();
const CHECKOUT_RATE_WINDOW = 10 * 60 * 1000;
const CHECKOUT_RATE_MAX = 5;
const MAX_DONATION_AMOUNT = 10_000_00; // 10.000 EUR in cents

setInterval(() => {
  const now = Date.now();
  for (const [key, times] of checkoutRateMap) {
    const fresh = times.filter(t => now - t < CHECKOUT_RATE_WINDOW);
    if (fresh.length === 0) checkoutRateMap.delete(key);
    else checkoutRateMap.set(key, fresh);
  }
}, 30 * 60 * 1000);

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

function isCheckoutRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (checkoutRateMap.get(ip) || []).filter(t => now - t < CHECKOUT_RATE_WINDOW);
  if (timestamps.length >= CHECKOUT_RATE_MAX) return true;
  checkoutRateMap.set(ip, [...timestamps, now]);
  return false;
}

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

// GET /api/stripe/session/:sessionId — retrieve donation details for the thanks page
router.get('/session/:sessionId', async (req: Request, res: Response, next) => {
  try {
    const donation = await prisma.donation.findFirst({
      where: { stripeSessionId: req.params.sessionId },
      select: { amount: true, currency: true, type: true, status: true, donorName: true },
    });
    if (!donation) {
      res.status(404).json({ error: 'Sesión no encontrada' });
      return;
    }
    res.json(donation);
  } catch (err) {
    next(err);
  }
});

// POST /api/stripe/checkout
router.post('/checkout', async (req: Request, res: Response, next) => {
  try {
    if (isCheckoutRateLimited(getClientIp(req))) {
      res.status(429).json({ error: 'Demasiados intentos. Por favor, espera unos minutos.' });
      return;
    }

    const { type, amount, stripeProductId, donorName, donorEmail, donorDni, animalName, lang } = req.body as {
      type: 'one_time' | 'subscription';
      amount?: number;
      stripeProductId?: string;
      donorName?: string;
      donorEmail?: string;
      donorDni?: string;
      animalName?: string;
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
      if (amount > MAX_DONATION_AMOUNT) {
        res.status(400).json({ error: 'Importe máximo: 10.000€' });
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
        if (amount > MAX_DONATION_AMOUNT) {
          res.status(400).json({ error: 'Importe máximo para suscripción: 10.000€' });
          return;
        }
        finalAmount = amount;
      }
    }

    // Validate DNI/NIF format if provided (Spanish NIF, NIE, or CIF)
    if (donorDni) {
      const dniClean = donorDni.trim().toUpperCase();
      const validDni = /^[0-9]{8}[A-Z]$/.test(dniClean)           // NIF: 12345678A
        || /^[XYZ][0-9]{7}[A-Z]$/.test(dniClean)                  // NIE: X1234567A
        || /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/.test(dniClean); // CIF: A1234567B
      if (!validDni) {
        res.status(400).json({ error: 'Formato de DNI/NIF/NIE no válido' });
        return;
      }
    }

    // All validation passed — now create the Donation record
    const donation = await prisma.donation.create({
      data: {
        type,
        status: 'pending',
        amount: finalAmount,
        currency: 'eur',
        donorName: donorName || null,
        donorEmail: donorEmail || null,
        donorDni: donorDni ? donorDni.trim().toUpperCase() : null,
        animalName: animalName || null,
        stripeProductId: product?.id || null,
      },
    });

    // Build Stripe session params
    const thankType = type === 'one_time' ? 'donation' : stripeProductId ? 'apadrinamiento' : 'subscription';
    const successUrl = `${FRONTEND_URL}/${lang}/gracias?type=${thankType}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${FRONTEND_URL}/${lang}/colabora/`;

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

    const session = await getStripe().checkout.sessions.create(sessionParams);

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
