import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
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
    const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
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

// POST /api/admin/upload
router.post('/', upload.single('image'), (req: Request & { file?: Express.Multer.File }, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se recibió ninguna imagen' });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (error) {
    next(error);
  }
});

export default router;
