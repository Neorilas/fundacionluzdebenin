import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/blog?page=1&limit=9
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 9, 50);
    const page  = Math.max(parseInt(req.query.page  as string) || 1, 1);
    const skip  = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where: { published: true } }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, slug: true, titleEs: true, titleFr: true,
          excerptEs: true, excerptFr: true, coverImage: true,
          publishedAt: true, createdAt: true,
        },
      }),
    ]);

    res.json({ posts, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/blog/rss?lang=es|fr  — RSS 2.0 feed
router.get('/rss', async (req, res, next) => {
  try {
    const lang = req.query.lang === 'fr' ? 'fr' : 'es';
    const SITE = process.env.FRONTEND_URL || 'https://fundacionluzdebenin.org';

    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        slug: true, titleEs: true, titleFr: true,
        excerptEs: true, excerptFr: true, coverImage: true,
        publishedAt: true, category: true,
      },
    });

    const channelTitle = lang === 'fr'
      ? 'Fondation Luz de Benín — Blog'
      : 'Fundación Luz de Benín — Blog';
    const channelDesc = lang === 'fr'
      ? 'Actualités et projets de la Fondation Luz de Benín au Bénin, Afrique occidentale.'
      : 'Noticias y proyectos de la Fundación Luz de Benín en Benín, África Occidental.';

    const escape = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const items = posts.map(p => {
      const title   = escape(lang === 'fr' ? (p.titleFr || p.titleEs) : p.titleEs);
      const excerpt = escape(lang === 'fr' ? (p.excerptFr || p.excerptEs || '') : (p.excerptEs || ''));
      const link    = `${SITE}/${lang}/blog/${p.slug}/`;
      const pubDate = (p.publishedAt || new Date()).toUTCString();
      const image   = p.coverImage
        ? `<enclosure url="${escape(p.coverImage.startsWith('http') ? p.coverImage : SITE + p.coverImage)}" type="image/webp" length="0"/>`
        : '';
      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${excerpt}</description>
      <pubDate>${pubDate}</pubDate>
      ${p.category ? `<category>${escape(p.category)}</category>` : ''}
      ${image}
    </item>`;
    }).join('');

    const rssUrl = `${SITE}/api/blog/rss?lang=${lang}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(channelTitle)}</title>
    <link>${SITE}/${lang}/blog/</link>
    <description>${escape(channelDesc)}</description>
    <language>${lang === 'fr' ? 'fr' : 'es'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${rssUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE}/logo.jpg</url>
      <title>${escape(channelTitle)}</title>
      <link>${SITE}/${lang}/blog/</link>
    </image>${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) { next(error); }
});

// GET /api/blog/preview/:slug?secret=XXX  — returns any post (published or draft) if secret matches
router.get('/preview/:slug', async (req, res, next) => {
  try {
    const PREVIEW_SECRET = process.env.PREVIEW_SECRET || 'preview-luz-benin';
    if (req.query.secret !== PREVIEW_SECRET) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    const post = await prisma.blogPost.findFirst({ where: { slug: req.params.slug } });
    if (!post) { res.status(404).json({ error: 'Post no encontrado' }); return; }
    res.json(post);
  } catch (error) { next(error); }
});

// GET /api/blog/:slug/related — up to 3 posts sharing category or tags
router.get('/:slug/related', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, published: true },
      select: { id: true, category: true, tags: true },
    });
    if (!post) { res.json([]); return; }

    let tags: string[] = [];
    try { tags = JSON.parse(post.tags || '[]'); } catch { /* ignore */ }

    const candidates = await prisma.blogPost.findMany({
      where: { published: true, id: { not: post.id } },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        id: true, slug: true, titleEs: true, titleFr: true,
        excerptEs: true, excerptFr: true, coverImage: true,
        publishedAt: true, category: true, tags: true,
      },
    });

    const scored = candidates.map(p => {
      let score = 0;
      if (post.category && p.category === post.category) score += 3;
      let ptags: string[] = [];
      try { ptags = JSON.parse(p.tags || '[]'); } catch { /* ignore */ }
      score += tags.filter(t => ptags.includes(t)).length;
      return { ...p, score };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

    res.json(scored.map(({ score: _s, tags: _t, ...p }) => p));
  } catch (error) { next(error); }
});

// GET /api/blog/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, published: true },
    });
    if (!post) {
      res.status(404).json({ error: 'Post no encontrado' });
      return;
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

export default router;
