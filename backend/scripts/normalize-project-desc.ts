/**
 * Convierte a Markdown las descripciones de proyectos que se guardaron como HTML.
 * El frontend renderiza descEs/descFr con react-markdown, asi que un <p> guardado
 * en la BD se ve como texto literal en la web.
 *
 * Ejecutar: npx ts-node scripts/normalize-project-desc.ts
 */
import prisma from '../src/lib/prisma';
import { htmlToMarkdown, looksLikeHtml } from '../src/lib/textUtils';

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, slug: true, descEs: true, descFr: true },
  });

  console.log(`Revisando ${projects.length} proyectos...`);
  let fixed = 0;

  for (const p of projects) {
    const data: { descEs?: string; descFr?: string } = {};
    if (p.descEs && looksLikeHtml(p.descEs)) data.descEs = htmlToMarkdown(p.descEs);
    if (p.descFr && looksLikeHtml(p.descFr)) data.descFr = htmlToMarkdown(p.descFr);

    if (Object.keys(data).length === 0) continue;

    await prisma.project.update({ where: { id: p.id }, data });
    console.log(`  OK: ${p.slug} (${Object.keys(data).join(', ')})`);
    fixed++;
  }

  console.log(fixed ? `\nListo: ${fixed} proyecto(s) normalizado(s).` : '\nNada que hacer: sin HTML en las descripciones.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
