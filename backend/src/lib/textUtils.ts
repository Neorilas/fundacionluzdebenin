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

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&apos;': "'", '&hellip;': '…',
  '&mdash;': '—', '&ndash;': '–', '&laquo;': '«', '&raquo;': '»',
  '&eacute;': 'é', '&egrave;': 'è', '&agrave;': 'à', '&ccedil;': 'ç',
  '&ntilde;': 'ñ', '&aacute;': 'á', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&[a-zA-Z#0-9]+;/g, (m) => HTML_ENTITIES[m.toLowerCase()] ?? m);
}

/**
 * Escapes the Markdown characters that would let a link label or image alt
 * break out of the [] () syntax it is spliced into.
 */
function escapeMdLabel(text: string): string {
  return text.replace(/([\\[\]])/g, '\\$1').replace(/\s+/g, ' ').trim();
}

/**
 * Keeps only URL schemes that are safe to publish. Anything else (javascript:,
 * data:, vbscript:, file:) is dropped so the link degrades to plain text.
 * Spaces and parentheses are encoded so they cannot close the Markdown
 * destination early.
 */
function safeUrl(url: string): string {
  const clean = decodeEntities(url).trim().replace(/[\u0000-\u001F\u007F]/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(clean)?.[1]?.toLowerCase();
  if (scheme && !['http', 'https', 'mailto', 'tel'].includes(scheme)) return '';
  return clean.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
}

/**
 * Detects whether a string carries HTML markup that would leak into the page
 * as visible tags when the value is rendered as Markdown or plain text.
 */
export function looksLikeHtml(text: string): boolean {
  return /<\/?(p|br|div|span|strong|b|em|i|u|ul|ol|li|h[1-6]|a|blockquote|table|tr|td|th|img|pre|code|hr)\b[^>]*>/i.test(text);
}

/**
 * Converts pasted HTML (from a WYSIWYG editor or the old site) into Markdown.
 *
 * Rich-text fields are stored as Markdown and rendered either with
 * react-markdown or as raw text, so any HTML that sneaks in shows up as
 * literal "<p>" tags on the public site. Content without HTML is returned
 * untouched, which keeps existing Markdown intact.
 */
export function htmlToMarkdown(input: string): string {
  if (!input || !looksLikeHtml(input)) return input;

  let out = input;

  // Drop content that must never reach the page.
  out = out.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');

  // Inline formatting.
  out = out.replace(/<\s*(strong|b)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (_m, _t, inner) => (inner.trim() ? `**${inner.trim()}**` : ''));
  out = out.replace(/<\s*(em|i)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (_m, _t, inner) => (inner.trim() ? `*${inner.trim()}*` : ''));
  out = out.replace(/<\s*code\b[^>]*>([\s\S]*?)<\/\s*code\s*>/gi, (_m, inner) => (inner.trim() ? `\`${inner.trim()}\`` : ''));

  // Links and images. Label and URL both come from pasted markup, so they are
  // escaped before being spliced into Markdown syntax.
  out = out.replace(/<\s*img\b[^>]*?src\s*=\s*["']([^"']*)["'][^>]*>/gi, (m, src) => {
    const alt = escapeMdLabel(decodeEntities(/alt\s*=\s*["']([^"']*)["']/i.exec(m)?.[1] || ''));
    const url = safeUrl(src);
    return url ? `![${alt}](${url})` : alt;
  });
  out = out.replace(/<\s*a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/\s*a\s*>/gi, (_m, href, inner) => {
    const label = escapeMdLabel(decodeEntities(inner.replace(/<[^>]+>/g, '')));
    if (!label) return '';
    const url = safeUrl(href);
    return url ? `[${label}](${url})` : label;
  });

  // Headings.
  out = out.replace(/<\s*h([1-6])\b[^>]*>([\s\S]*?)<\/\s*h\1\s*>/gi, (_m, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    return text ? `\n\n${'#'.repeat(Number(level))} ${text}\n\n` : '\n\n';
  });

  // Lists — ordered items are numbered per <ol> block.
  out = out.replace(/<\s*ol\b[^>]*>([\s\S]*?)<\/\s*ol\s*>/gi, (_m, inner) => {
    let n = 0;
    const items = inner.replace(/<\s*li\b[^>]*>([\s\S]*?)<\/\s*li\s*>/gi, (_im: string, li: string) => {
      const text = li.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return text ? `\n${++n}. ${text}` : '';
    });
    return `\n\n${items.replace(/<[^>]+>/g, '').trim()}\n\n`;
  });
  out = out.replace(/<\s*li\b[^>]*>([\s\S]*?)<\/\s*li\s*>/gi, (_m, inner) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? `\n- ${text}` : '';
  });

  out = out.replace(/<\s*blockquote\b[^>]*>([\s\S]*?)<\/\s*blockquote\s*>/gi, (_m, inner) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? `\n\n> ${text}\n\n` : '\n\n';
  });

  // Block boundaries become blank lines. A <br> also becomes one: Markdown
  // collapses single newlines, so the break the author wanted would be lost.
  out = out.replace(/<\s*br\s*\/?\s*>/gi, '\n\n');
  out = out.replace(/<\/\s*(p|div|section|article|tr|table|ul|ol|h[1-6])\s*>/gi, '\n\n');
  out = out.replace(/<\s*hr\s*\/?\s*>/gi, '\n\n---\n\n');

  // Anything left over is dropped rather than shown to the visitor.
  out = out.replace(/<[^>]*>/g, '');
  out = decodeEntities(out);

  return out
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
