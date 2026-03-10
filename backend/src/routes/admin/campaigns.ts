import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';
import { revalidate, PATHS } from '../../lib/revalidate';

const router = Router();
router.use(authMiddleware);

const parseCampaign = (c: { coverItems: string; extraItems: string; [key: string]: unknown }) => ({
  ...c,
  coverItems: JSON.parse(c.coverItems || '[]'),
  extraItems: JSON.parse(c.extraItems || '[]'),
});

// GET /api/admin/campaigns
router.get('/', async (_req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(campaigns.map(parseCampaign));
  } catch (error) { next(error); }
});

// GET /api/admin/campaigns/:id
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
    });
    if (!campaign) {
      res.status(404).json({ error: 'Campaña no encontrada' });
      return;
    }
    res.json(parseCampaign(campaign));
  } catch (error) { next(error); }
});

// POST /api/admin/campaigns
router.post('/', async (req, res, next) => {
  try {
    const {
      slug, emoji, amountCents, colorScheme, active, sortOrder,
      tagEs, tagFr, titleEs, titleFr, taglineEs, taglineFr,
      priceLabel, periodEs, periodFr, ctaEs, ctaFr, fineEs, fineFr,
      coverItems,
      projectTitleEs, projectTitleFr, projectTextEs, projectTextFr,
      projectBadgeEs, projectBadgeFr, projectLinkEs, projectLinkFr, projectHref,
      extraType, extraTitleEs, extraTitleFr, extraItems,
      ctaBottomEs, ctaBottomFr, ctaBottomNoteEs, ctaBottomNoteFr,
      metaTitleEs, metaTitleFr, metaDescEs, metaDescFr,
    } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        slug, emoji: emoji || '🐾',
        amountCents: Number(amountCents),
        colorScheme: colorScheme || 'amber',
        active: active !== undefined ? active : true,
        sortOrder: sortOrder || 0,
        tagEs: tagEs || '', tagFr: tagFr || '',
        titleEs: titleEs || '', titleFr: titleFr || '',
        taglineEs: taglineEs || '', taglineFr: taglineFr || '',
        priceLabel: priceLabel || '',
        periodEs: periodEs || '', periodFr: periodFr || '',
        ctaEs: ctaEs || '', ctaFr: ctaFr || '',
        fineEs: fineEs || '', fineFr: fineFr || '',
        coverItems: JSON.stringify(coverItems || []),
        projectTitleEs: projectTitleEs || '', projectTitleFr: projectTitleFr || '',
        projectTextEs: projectTextEs || '', projectTextFr: projectTextFr || '',
        projectBadgeEs: projectBadgeEs || '', projectBadgeFr: projectBadgeFr || '',
        projectLinkEs: projectLinkEs || '', projectLinkFr: projectLinkFr || '',
        projectHref: projectHref || '',
        extraType: extraType || '',
        extraTitleEs: extraTitleEs || '', extraTitleFr: extraTitleFr || '',
        extraItems: JSON.stringify(extraItems || []),
        ctaBottomEs: ctaBottomEs || '', ctaBottomFr: ctaBottomFr || '',
        ctaBottomNoteEs: ctaBottomNoteEs || '', ctaBottomNoteFr: ctaBottomNoteFr || '',
        metaTitleEs: metaTitleEs || '', metaTitleFr: metaTitleFr || '',
        metaDescEs: metaDescEs || '', metaDescFr: metaDescFr || '',
      },
    });
    revalidate(PATHS.campaign(campaign.slug), ['campaigns', `campaign-${campaign.slug}`]);
    res.status(201).json(parseCampaign(campaign));
  } catch (error) { next(error); }
});

// PUT /api/admin/campaigns/:id
router.put('/:id', async (req, res, next) => {
  try {
    const body = req.body;
    const data: Record<string, unknown> = {};

    const fields = [
      'slug', 'emoji', 'colorScheme', 'active', 'sortOrder',
      'tagEs', 'tagFr', 'titleEs', 'titleFr', 'taglineEs', 'taglineFr',
      'priceLabel', 'periodEs', 'periodFr', 'ctaEs', 'ctaFr', 'fineEs', 'fineFr',
      'projectTitleEs', 'projectTitleFr', 'projectTextEs', 'projectTextFr',
      'projectBadgeEs', 'projectBadgeFr', 'projectLinkEs', 'projectLinkFr', 'projectHref',
      'extraType', 'extraTitleEs', 'extraTitleFr',
      'ctaBottomEs', 'ctaBottomFr', 'ctaBottomNoteEs', 'ctaBottomNoteFr',
      'metaTitleEs', 'metaTitleFr', 'metaDescEs', 'metaDescFr',
    ];

    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.amountCents !== undefined) data.amountCents = Number(body.amountCents);
    if (body.coverItems !== undefined) data.coverItems = JSON.stringify(body.coverItems);
    if (body.extraItems !== undefined) data.extraItems = JSON.stringify(body.extraItems);

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data,
    });
    revalidate(PATHS.campaign(campaign.slug), ['campaigns', `campaign-${campaign.slug}`]);
    res.json(parseCampaign(campaign));
  } catch (error) { next(error); }
});

// DELETE /api/admin/campaigns/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.delete({ where: { id: req.params.id } });
    revalidate(PATHS.campaign(campaign.slug), ['campaigns', `campaign-${campaign.slug}`]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
