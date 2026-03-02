import { Router, Request } from 'express';
import prisma from '../../lib/prisma';
import { sendContactNotification } from '../../lib/mailer';

const router = Router();

// Simple in-memory rate limiter: max 5 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  rateLimitMap.set(ip, [...timestamps, now]);
  return false;
}

// POST /api/contact
router.post('/', async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'Demasiados intentos. Por favor, espera unos minutos.' });
      return;
    }

    const { name, email, subject, message, website } = req.body;

    // Honeypot: bots fill the hidden "website" field; real users leave it empty
    if (website) {
      // Fake success to not reveal detection to bots
      res.status(201).json({ success: true });
      return;
    }

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Fire-and-forget email notification — non-blocking
    sendContactNotification({ name, email, subject, message });

    res.status(201).json({ success: true, id: contact.id });
  } catch (error) {
    next(error);
  }
});

export default router;
