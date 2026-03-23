import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../../lib/prisma';
import { sendPaymentFailedNotification } from '../../lib/mailer';

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

// POST /api/stripe/webhook — raw body required for signature verification
router.post(
  '/',
  require('express').raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET is not configured');
      res.status(500).json({ error: 'Webhook not configured' });
      return;
    }

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', (err as Error).message);
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const donationId = session.metadata?.donationId;
          if (!donationId) break;

          const existing = await prisma.donation.findUnique({ where: { id: donationId } });
          if (!existing || existing.status === 'completed') break;

          await prisma.donation.update({
            where: { id: donationId },
            data: {
              status: 'completed',
              paidAt: new Date(),
              stripePaymentIntentId: typeof session.payment_intent === 'string'
                ? session.payment_intent
                : undefined,
              stripeSubscriptionId: typeof session.subscription === 'string'
                ? session.subscription
                : undefined,
              stripeCustomerId: typeof session.customer === 'string'
                ? session.customer
                : undefined,
            },
          });
          console.log(`✅ Donation ${donationId} completed`);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const subSucceeded = invoice.parent?.subscription_details?.subscription;
          const subIdSucceeded = typeof subSucceeded === 'string' ? subSucceeded : subSucceeded?.id;
          console.log(`💰 Recurring payment succeeded for subscription: ${subIdSucceeded}`);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subFailed = invoice.parent?.subscription_details?.subscription;
          const subIdFailed = typeof subFailed === 'string' ? subFailed : subFailed?.id;
          if (subIdFailed) {
            const affected = await prisma.donation.findFirst({
              where: { stripeSubscriptionId: subIdFailed, status: { not: 'failed' } },
              select: { donorEmail: true, donorName: true, amount: true, currency: true },
            });
            await prisma.donation.updateMany({
              where: { stripeSubscriptionId: subIdFailed },
              data: { status: 'failed' },
            });
            // Notify admin about the failed payment
            if (affected?.donorEmail) {
              sendPaymentFailedNotification({
                donorEmail: affected.donorEmail,
                donorName: affected.donorName || undefined,
                amount: affected.amount,
                currency: affected.currency,
              });
            }
          }
          console.log(`❌ Payment failed for subscription: ${subIdFailed}`);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await prisma.donation.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: 'canceled' },
          });
          console.log(`🚫 Subscription canceled: ${subscription.id}`);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error('❌ Error processing webhook event:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({ received: true });
  }
);

export default router;
