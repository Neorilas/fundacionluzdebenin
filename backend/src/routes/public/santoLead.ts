import { Router, Request } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// Simple rate limiter: max 10 per IP per hour
const rateLimitMap = new Map<string, number[]>();
const WINDOW = 60 * 60 * 1000;
const MAX = 10;

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < WINDOW);
  if (timestamps.length >= MAX) return true;
  rateLimitMap.set(ip, [...timestamps, now]);
  return false;
}

// POST /api/santo-lead
router.post('/', async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'Demasiados intentos. Por favor, espera.' });
      return;
    }

    const { email, nombre, santo_asignado, santo_id, acepta_comunicaciones, lang } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    if (!santo_asignado) {
      res.status(400).json({ error: 'Faltan datos del santo' });
      return;
    }

    await prisma.santoLead.create({
      data: {
        email: email.trim().toLowerCase(),
        nombre: (nombre || '').trim(),
        santoId: Number(santo_id) || 0,
        santoNombre: santo_asignado,
        aceptaComunicaciones: !!acepta_comunicaciones,
        lang: lang || 'es',
      },
    });

    // If user accepted communications, subscribe to Mailchimp
    if (acepta_comunicaciones) {
      const apiKey = process.env.MAILCHIMP_API_KEY;
      const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
      const server = process.env.MAILCHIMP_SERVER || 'us16';

      if (apiKey && audienceId) {
        fetch(`https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: email.trim().toLowerCase(),
            status: 'subscribed',
            merge_fields: { FNAME: nombre || '' },
            tags: ['web', lang === 'fr' ? 'francés' : 'español', 'tu-santo'],
          }),
          signal: AbortSignal.timeout(8000),
        }).catch(() => {/* fire-and-forget */});
      }
    }

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
