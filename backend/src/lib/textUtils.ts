/**
 * Pure utility functions — tested in src/__tests__/textUtils.test.ts
 */

/**
 * Converts a title to a URL-safe slug.
 * "Mi Título Genial!" → "mi-titulo-genial"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Splits a paragraph into chunks of at most `maxLen` characters,
 * breaking at sentence boundaries where possible.
 * Used to stay within the MyMemory translation API ~500-char limit.
 */
export function makeChunks(text: string, maxLen = 450): string[] {
  if (text.length <= maxLen) return [text];
  const sentences = text.split(/(?<=[.!?…])\s+/);
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences) {
    const candidate = cur ? `${cur} ${s}` : s;
    if (candidate.length <= maxLen) {
      cur = candidate;
    } else {
      if (cur) chunks.push(cur);
      cur = s.length <= maxLen ? s : s.substring(0, maxLen);
    }
  }
  if (cur) chunks.push(cur);
  return chunks.length ? chunks : [text.substring(0, maxLen)];
}

/**
 * Strips Markdown syntax and returns plain text.
 * Useful for generating excerpts and counting words.
 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>#|]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

/**
 * Counts the words in a Markdown string (ignores syntax).
 */
export function countWords(md: string): number {
  return stripMarkdown(md).split(/\s+/).filter(w => w.length > 0).length;
}
