import { SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') === 'fr' ? 'fr' : 'es';
  const isFr = lang === 'fr';

  let posts: Awaited<ReturnType<typeof api.getBlogPosts>>['posts'] = [];
  try {
    const result = await api.getBlogPosts(1, 50);
    posts = result.posts.filter(p => p.published);
  } catch {
    posts = [];
  }

  const items = posts.map(p => {
    const title = isFr ? (p.titleFr || p.titleEs) : p.titleEs;
    const excerpt = isFr ? (p.excerptFr || p.excerptEs || '') : (p.excerptEs || '');
    const pubDate = p.publishedAt ? new Date(p.publishedAt).toUTCString() : '';
    const imgUrl = p.coverImage
      ? (p.coverImage.startsWith('http') ? p.coverImage : `${SITE_URL}${p.coverImage}`)
      : '';
    return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${SITE_URL}/${lang}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/${lang}/blog/${p.slug}/</guid>
      <description><![CDATA[${excerpt}]]></description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${imgUrl ? `<enclosure url="${imgUrl}" type="image/jpeg" length="0" />` : ''}
    </item>`;
  }).join('');

  const channelTitle = isFr
    ? 'Fondation Lumière du Bénin — Blog'
    : 'Fundación Luz de Benín — Blog';
  const channelDesc = isFr
    ? 'Actualités et mises à jour de la Fondation Lumière du Bénin'
    : 'Noticias y actualizaciones de la Fundación Luz de Benín';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channelTitle}</title>
    <link>${SITE_URL}/${lang}/blog/</link>
    <description>${channelDesc}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml?lang=${lang}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
