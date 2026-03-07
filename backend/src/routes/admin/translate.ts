import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { makeChunks } from '../../lib/textUtils';

const router = Router();
router.use(authMiddleware);

// MyMemory free API: ~500 char limit per request
async function translateChunk(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const data = await response.json() as { responseData?: { translatedText?: string }; responseStatus?: number };
  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  return text; // fallback: return original on error
}

/** Strip inline HTML tags and decode basic entities to get plain text. */
function innerText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Translate a plain-text string, splitting into chunks if needed. */
async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return text;
  const chunks = makeChunks(text);
  const results: string[] = [];
  for (const chunk of chunks) {
    results.push(await translateChunk(chunk, from, to));
  }
  return results.join(' ');
}

// POST /api/admin/translate
// Body: { text: string, from?: string, to?: string }
// Supports both plain Markdown (split by \n\n) and HTML (split by block tags).
router.post('/', async (req, res, next) => {
  try {
    const { text, from = 'es', to = 'fr' } = req.body;

    if (!text?.trim()) {
      res.json({ translatedText: '' });
      return;
    }

    // ── HTML content (TipTap output) ──────────────────────────────────────────
    if (text.trim().startsWith('<')) {
      const parts: string[] = [];
      let lastIndex = 0;
      const re = /(<(h[1-6]|p|li|blockquote)([^>]*)>)([\s\S]*?)(<\/\2>)/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        // preserve any HTML between blocks (e.g. <ul>, <ol> wrappers)
        if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
        const plain = innerText(m[4]);
        const tr = plain ? await translateText(plain, from, to) : '';
        parts.push(`${m[1]}${tr}${m[5]}`);
        lastIndex = m.index + m[0].length;
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex));
      res.json({ translatedText: parts.join('') || text });
      return;
    }

    // ── Plain Markdown (legacy) ───────────────────────────────────────────────
    const paragraphs = text.split(/\n\n/);
    const translatedParagraphs = await Promise.all(paragraphs.map(async (para: string) => {
      if (!para.trim()) return para;
      if (para.trim().startsWith('```')) return para;
      return translateText(para, from, to);
    }));
    res.json({ translatedText: translatedParagraphs.join('\n\n') });
  } catch (error) {
    next(error);
  }
});

export default router;
