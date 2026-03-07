/**
 * Migra contentEs/contentFr de Markdown a HTML.
 * Ejecutar: node scripts/migrate-md-to-html.cjs
 */
const { PrismaClient } = require('@prisma/client');
const { marked } = require('marked');

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: { id: true, titleEs: true, contentEs: true, contentFr: true },
  });

  console.log(`Encontrados ${posts.length} posts. Migrando...`);

  for (const post of posts) {
    const updates = {};

    if (post.contentEs && !post.contentEs.trim().startsWith('<')) {
      updates.contentEs = await marked(post.contentEs);
    }
    if (post.contentFr && !post.contentFr.trim().startsWith('<')) {
      updates.contentFr = await marked(post.contentFr);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.blogPost.update({ where: { id: post.id }, data: updates });
      console.log(`  OK: ${post.titleEs}`);
    } else {
      console.log(`  --: ${post.titleEs} (ya en HTML, omitido)`);
    }
  }

  console.log('\nMigracion completada.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
