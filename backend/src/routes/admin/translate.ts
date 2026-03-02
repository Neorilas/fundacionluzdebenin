import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// POST /api/admin/translate
// Body: { text: string, from?: string, to?: string }
// Uses MyMemory free API (no key required, 5000 words/day)
router.post('/', async (req, res, next) => {
  try {
    const { text, from = 'es', to = 'fr' } = req.body;

    if (!text?.trim()) {
      res.json({ translatedText: '' });
      return;
    }

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json() as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      res.json({ translatedText: data.responseData.translatedText });
    } else {
      res.status(502).json({ error: 'Translation service unavailable' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
