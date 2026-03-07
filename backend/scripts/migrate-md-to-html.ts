/**
 * Migra el contenido de los posts del blog de Markdown a HTML.
 * Usar una sola vez: npx ts-node scripts/migrate-md-to-html.ts
 */
import { marked } from 'marked';
import prisma from '../src/lib/prisma';

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, titleEs: true, contentEs: true, contentFr: true },
  });

  console.log(`Encontrados ${posts.length} posts. Migrando...`);

  for (const post of posts) {
    const updates: { contentEs?: string; contentFr?: string } = {};

    if (post.contentEs && !post.contentEs.trim().startsWith('<')) {
      updates.contentEs = await marked(post.contentEs);
    }
    if (post.contentFr && !post.contentFr.trim().startsWith('<')) {
      updates.contentFr = await marked(post.contentFr);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.blogPost.update({ where: { id: post.id }, data: updates });
      console.log(`  ✓ ${post.titleEs}`);
    } else {
      console.log(`  — ${post.titleEs} (ya en HTML, omitido)`);
    }
  }

  console.log('Migración completada.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
