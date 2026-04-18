import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const CACHE_DIR = path.join(UPLOAD_DIR, '.cache');

// Allowed widths to prevent cache flooding (Next.js default deviceSizes + imageSizes)
const ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function findClosestWidth(requested: number): number {
  return ALLOWED_WIDTHS.find(w => w >= requested) || ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/**
 * Image optimization middleware for /uploads routes.
 * When ?w=WIDTH is present, serves a resized WebP version with disk caching.
 * Without query params, falls through to express.static.
 */
export function imageOptimizer(req: Request, res: Response, next: NextFunction): void {
  const widthParam = req.query.w;
  const qualityParam = req.query.q;

  // No optimization requested — let express.static handle it
  if (!widthParam) {
    next();
    return;
  }

  const requestedWidth = parseInt(widthParam as string, 10);
  if (isNaN(requestedWidth) || requestedWidth < 1) {
    next();
    return;
  }

  const width = findClosestWidth(requestedWidth);
  const quality = Math.min(100, Math.max(1, parseInt(qualityParam as string, 10) || 80));

  // Sanitize filename — only allow the basename (no path traversal)
  const filename = path.basename(req.path);
  const originalPath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(originalPath)) {
    next();
    return;
  }

  // Cache key: width_quality_filename.webp
  const cacheFilename = `${width}_${quality}_${path.parse(filename).name}.webp`;
  const cachePath = path.join(CACHE_DIR, cacheFilename);

  // Serve from cache if available
  if (fs.existsSync(cachePath)) {
    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Image-Optimized': 'cache-hit',
    });
    res.sendFile(cachePath);
    return;
  }

  // Generate optimized version
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  sharp(originalPath)
    .resize(width, undefined, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(cachePath)
    .then(() => {
      res.set({
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Image-Optimized': 'generated',
      });
      res.sendFile(cachePath);
    })
    .catch((err) => {
      console.error('Image optimization error:', err);
      // Fall through to serve the original
      next();
    });
}
