import { Router, Request } from 'express';
import prisma from '../../lib/prisma';
import { sendContactNotification, sendContactConfirmation } from '../../lib/mailer';

const router = Router();

// --- Rate limiters ---
// Per-IP: max 3 submissions per 10 minutes
const ipRateLimitMap = new Map<string, number[]>();
const IP_RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const IP_RATE_LIMIT_MAX = 3;

// Per-email: max 2 submissions per hour
const emailRateLimitMap = new Map<string, number[]>();
const EMAIL_RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const EMAIL_RATE_LIMIT_MAX = 2;

// Minimum seconds a human needs to fill the form (bots submit instantly)
const MIN_FILL_TIME_MS = 3000;

// Clean up stale entries every 30 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, times] of ipRateLimitMap) {
    const fresh = times.filter(t => now - t < IP_RATE_LIMIT_WINDOW);
    if (fresh.length === 0) ipRateLimitMap.delete(key);
    else ipRateLimitMap.set(key, fresh);
  }
  for (const [key, times] of emailRateLimitMap) {
    const fresh = times.filter(t => now - t < EMAIL_RATE_LIMIT_WINDOW);
    if (fresh.length === 0) emailRateLimitMap.delete(key);
    else emailRateLimitMap.set(key, fresh);
  }
}, 30 * 60 * 1000);

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(map: Map<string, number[]>, key: string, window: number, max: number): boolean {
  const now = Date.now();
  const timestamps = (map.get(key) || []).filter(t => now - t < window);
  if (timestamps.length >= max) return true;
  map.set(key, [...timestamps, now]);
  return false;
}

// Returns true if the text looks like spam
function isSpam(subject: string, message: string): boolean {
  const combined = `${subject} ${message}`;
  // More than 2 URLs is a red flag
  const urls = combined.match(/(https?:\/\/|www\.)\S+/gi) || [];
  if (urls.length > 2) return true;
  // Common spam keywords (EN)
  const spamPatternEn = /\b(casino|viagra|cialis|porn|xxx|lottery|winner|prize|click here|unsubscribe|crypto|bitcoin|investment opportunity|make money|free money|guaranteed|limited time offer)\b/i;
  if (spamPatternEn.test(combined)) return true;
  // SEO / marketing spam in Spanish — very common on NGO contact forms
  const spamPatternEs = /\b(posicionamiento web|agencia (de )?marketing|servicios? (de )?(seo|sem|marketing digital)|primera p[aá]gina de google|mejorar (tu|su|el) (posicionamiento|ranking|visibilidad)|estrategia digital|campa[nñ]a (de )?(google ads|adwords|publicidad online)|presupuesto sin compromiso|linkbuilding|backlinks|auditor[ií]a (seo|web|gratuita)|consultora? (de )?(marketing|seo|digital))\b/i;
  if (spamPatternEs.test(combined)) return true;
  // Generic cold outreach patterns
  const coldOutreach = /\b(sin compromiso|le escribo para ofrecer|me pongo en contacto para ofrecer|hemos visto (su|tu) (web|p[aá]gina)|aumentar (sus?|tus?) (ventas|clientes|visitas|tr[aá]fico))\b/i;
  if (coldOutreach.test(combined)) return true;
  return false;
}

// POST /api/contact
router.post('/', async (req, res, next) => {
  try {
    const ip = getClientIp(req);

    // Honeypot: bots fill the hidden "website" field; real users leave it empty
    const { name, email, subject, message, website, _t, lang } = req.body;
    if (website) {
      res.status(201).json({ success: true });
      return;
    }

    // Timing check: all legitimate forms send _t — missing means bot
    if (!_t) {
      res.status(201).json({ success: true }); // silent fake success
      return;
    }
    try {
      const loadTime = parseInt(Buffer.from(_t, 'base64').toString(), 10);
      if (isNaN(loadTime) || Date.now() - loadTime < MIN_FILL_TIME_MS) {
        res.status(429).json({ error: 'Formulario enviado demasiado rápido.' });
        return;
      }
      // Reject if _t is older than 1 hour (stale form or replayed token)
      if (Date.now() - loadTime > 60 * 60 * 1000) {
        res.status(201).json({ success: true }); // silent fake success
        return;
      }
    } catch {
      res.status(201).json({ success: true }); // malformed token = bot
      return;
    }

    // IP rate limit
    if (checkRateLimit(ipRateLimitMap, ip, IP_RATE_LIMIT_WINDOW, IP_RATE_LIMIT_MAX)) {
      res.status(429).json({ error: 'Demasiados intentos. Por favor, espera unos minutos.' });
      return;
    }

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    // Field length limits
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      res.status(400).json({ error: 'Uno o más campos superan la longitud máxima permitida.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    // Per-email rate limit (after basic validation so we have a clean email)
    const emailKey = email.toLowerCase().trim();
    if (checkRateLimit(emailRateLimitMap, emailKey, EMAIL_RATE_LIMIT_WINDOW, EMAIL_RATE_LIMIT_MAX)) {
      res.status(429).json({ error: 'Ya hemos recibido un mensaje reciente con este email. Por favor, espera antes de enviar otro.' });
      return;
    }

    // Content spam check — silent fake success to not reveal detection
    if (isSpam(subject, message)) {
      res.status(201).json({ success: true });
      return;
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Fire-and-forget emails — non-blocking
    sendContactNotification({ name, email, subject, message });
    sendContactConfirmation({ name, email, subject, lang });

    res.status(201).json({ success: true, id: contact.id });
  } catch (error) {
    next(error);
  }
});

export default router;
