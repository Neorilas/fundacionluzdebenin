import { Router } from 'express';
import { sendNewsletterConfirmation } from '../../lib/mailer';
import prisma from '../../lib/prisma';

const router = Router();

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || '';
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || '';
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER || 'us16';

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email, lang } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
      res.status(503).json({ error: 'Newsletter no configurado' });
      return;
    }

    const response = await fetch(
      `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          tags: ['web', lang === 'fr' ? 'francés' : 'español'],
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    const data = await response.json() as { title?: string; detail?: string };

    // "Member Exists" is not an error — just respond with success
    if (response.ok || data.title === 'Member Exists') {
      if (response.ok) {
        sendNewsletterConfirmation({ email, lang });
        const tags = JSON.stringify(['newsletter', lang === 'fr' ? 'frances' : 'espanol']);
        prisma.subscriber.upsert({
          where: { email: email.trim().toLowerCase() },
          update: { lang: lang || 'es', active: true },
          create: { email: email.trim().toLowerCase(), lang: lang || 'es', source: 'newsletter', tags },
        }).catch(() => {/* non-critical */});
      }
      res.json({ success: true, alreadySubscribed: data.title === 'Member Exists' });
      return;
    }

    res.status(400).json({ error: data.detail || 'Error al suscribirse' });
  } catch (error) {
    next(error);
  }
});

export default router;
