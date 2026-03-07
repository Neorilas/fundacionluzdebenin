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

// POST /api/admin/translate
// Body: { text: string, from?: string, to?: string }
// Uses MyMemory free API (no key required, 5000 words/day)
// Long texts are split by paragraph → chunks to stay within the 500-char limit.
router.post('/', async (req, res, next) => {
  try {
    const { text, from = 'es', to = 'fr' } = req.body;

    if (!text?.trim()) {
      res.json({ translatedText: '' });
      return;
    }

    const paragraphs = text.split(/\n\n/);
    const translatedParagraphs = await Promise.all(paragraphs.map(async (para: string) => {
      if (!para.trim()) return para;
      if (para.trim().startsWith('```')) return para; // don't translate code blocks
      const chunks = makeChunks(para);
      const results: string[] = [];
      for (const chunk of chunks) {
        results.push(await translateChunk(chunk, from, to));
      }
      return results.join(' ');
    }));

    res.json({ translatedText: translatedParagraphs.join('\n\n') });
  } catch (error) {
    next(error);
  }
});

export default router;
