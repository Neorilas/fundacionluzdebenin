import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

const parseCampaign = (c: { coverItems: string; extraItems: string; [key: string]: unknown }) => ({
  ...c,
  coverItems: JSON.parse(c.coverItems || '[]'),
  extraItems: JSON.parse(c.extraItems || '[]'),
});

// GET /api/campaigns — active campaigns ordered by sortOrder
router.get('/', async (_req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(campaigns.map(parseCampaign));
  } catch (error) { next(error); }
});

// GET /api/campaigns/:slug — one campaign by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { slug: req.params.slug, active: true },
    });
    if (!campaign) {
      res.status(404).json({ error: 'Campaña no encontrada' });
      return;
    }
    res.json(parseCampaign(campaign));
  } catch (error) { next(error); }
});

export default router;
