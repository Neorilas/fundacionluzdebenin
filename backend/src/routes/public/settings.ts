import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

const PUBLIC_KEYS = [
  'siteName', 'siteNameFr', 'emailContact', 'phoneContact', 'address',
  'socialFacebook', 'socialInstagram', 'bankAccount', 'bankIban', 'bankBic',
];

// GET /api/settings
router.get('/', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    });
    const obj: Record<string, string> = {};
    for (const s of settings) {
      obj[s.key] = s.value;
    }
    res.json(obj);
  } catch (error) {
    next(error);
  }
});

export default router;
