import { Router } from 'express';
import prisma from '../../lib/prisma';
import { buildLlmsTxt } from '../../lib/llmsTxt';
import { buildPublicProjectWhere } from '../../lib/projectVisibility';

const router = Router();

// GET /api/llms.txt — served at /llms.txt through a Next.js rewrite
router.get('/', async (_req, res, next) => {
  try {
    const [projects, campaigns, posts] = await Promise.all([
      prisma.project.findMany({
        where: buildPublicProjectWhere(),
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: { slug: true, titleEs: true, titleFr: true, descEs: true, metaDescEs: true },
      }),
      prisma.campaign.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        select: { slug: true, titleEs: true, titleFr: true, taglineEs: true },
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 30,
        select: { slug: true, titleEs: true, titleFr: true, excerptEs: true },
      }),
    ]);

    const site = process.env.FRONTEND_URL || 'https://fundacionluzdebenin.org';
    res.type('text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buildLlmsTxt({ site, projects, campaigns, posts }));
  } catch (error) { next(error); }
});

export default router;
