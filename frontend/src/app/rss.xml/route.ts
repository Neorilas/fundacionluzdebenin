import { SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  let posts: Awaited<ReturnType<typeof api.getBlogPosts>>['posts'] = [];
  try {
    const result = await api.getBlogPosts(1, 50);
    posts = result.posts.filter(p => p.published);
  } catch {
    posts = [];
  }

  const items = posts.map(p => {
    const pubDate = p.publishedAt ? new Date(p.publishedAt).toUTCString() : '';
    const imgUrl = p.coverImage
      ? (p.coverImage.startsWith('http') ? p.coverImage : `${SITE_URL}${p.coverImage}`)
      : '';
    return `
    <item>
      <title><![CDATA[${p.titleEs}]]></title>
      <link>${SITE_URL}/es/blog/${p.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/es/blog/${p.slug}/</guid>
      <description><![CDATA[${p.excerptEs || ''}]]></description>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${imgUrl ? `<enclosure url="${imgUrl}" type="image/jpeg" length="0" />` : ''}
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fundación Luz de Benín — Blog</title>
    <link>${SITE_URL}/es/blog/</link>
    <description>Noticias y actualizaciones de la Fundación Luz de Benín</description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
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
