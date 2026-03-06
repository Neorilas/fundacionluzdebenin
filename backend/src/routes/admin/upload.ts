import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Use memory storage — sharp processes the buffer before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|avif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// GET /api/admin/upload — list uploaded files
router.get('/', (_req, res, next) => {
  try {
    const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)$/i;
    const files = fs.existsSync(UPLOAD_DIR)
      ? fs.readdirSync(UPLOAD_DIR)
          .filter(f => IMAGE_EXT.test(f))
          .map(f => {
            const stat = fs.statSync(path.join(UPLOAD_DIR, f));
            return { url: `/uploads/${f}`, filename: f, size: stat.size, createdAt: stat.mtime.toISOString() };
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : [];
    res.json(files);
  } catch (error) { next(error); }
});

// POST /api/admin/upload — convert to WebP and save
router.post('/', upload.single('image'), async (req: Request & { file?: Express.Multer.File }, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se recibió ninguna imagen' });
      return;
    }

    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${unique}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // GIFs are kept as-is (animation support)
    if (req.file.mimetype === 'image/gif') {
      const gifFilename = `${unique}.gif`;
      fs.writeFileSync(path.join(UPLOAD_DIR, gifFilename), req.file.buffer);
      res.json({ url: `/uploads/${gifFilename}`, filename: gifFilename });
      return;
    }

    await sharp(req.file.buffer)
      .webp({ quality: 88 })
      .toFile(filepath);

    res.json({ url: `/uploads/${filename}`, filename });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/upload/:filename
router.delete('/:filename', (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const filepath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filepath)) {
      res.status(404).json({ error: 'Archivo no encontrado' });
      return;
    }
    fs.unlinkSync(filepath);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
