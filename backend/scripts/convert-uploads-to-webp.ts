/**
 * One-time script: converts existing uploads (jpg/jpeg/png) to WebP
 * and updates all DB references accordingly.
 *
 * Usage (from backend/):
 *   npx ts-node --project tsconfig.json scripts/convert-uploads-to-webp.ts
 *   - or, in production via Docker exec -
 *   npx ts-node scripts/convert-uploads-to-webp.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const WEBP_QUALITY = 82;

/** Replace all occurrences of oldUrl with newUrl in a string */
function replaceUrl(text: string, oldUrl: string, newUrl: string): string {
  return text.split(oldUrl).join(newUrl);
}

async function main() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('Upload dir not found:', UPLOAD_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOAD_DIR);
  const toConvert = files.filter(f => /\.(jpe?g|png)$/i.test(f));

  if (toConvert.length === 0) {
    console.log('No JPG/PNG files found. Nothing to do.');
    return;
  }

  console.log(`Found ${toConvert.length} file(s) to convert:\n`);

  const renames: Array<{ oldPath: string; newPath: string; oldUrl: string; newUrl: string }> = [];

  // Step 1: convert files
  for (const file of toConvert) {
    const oldPath = path.join(UPLOAD_DIR, file);
    const newName = file.replace(/\.(jpe?g|png)$/i, '.webp');
    const newPath = path.join(UPLOAD_DIR, newName);

    if (fs.existsSync(newPath)) {
      console.log(`  SKIP  ${file} → ${newName} (already exists)`);
      continue;
    }

    try {
      await sharp(oldPath).webp({ quality: WEBP_QUALITY }).toFile(newPath);
      const oldSize = fs.statSync(oldPath).size;
      const newSize = fs.statSync(newPath).size;
      const saving = Math.round((1 - newSize / oldSize) * 100);
      console.log(`  OK    ${file} → ${newName}  (${kb(oldSize)} → ${kb(newSize)}, -${saving}%)`);
      renames.push({
        oldPath,
        newPath,
        oldUrl: `/uploads/${file}`,
        newUrl: `/uploads/${newName}`,
      });
    } catch (err) {
      console.error(`  ERROR ${file}:`, err);
    }
  }

  if (renames.length === 0) {
    console.log('\nNothing converted. Exiting.');
    return;
  }

  // Step 2: update DB references
  console.log('\nUpdating database references...');

  for (const { oldUrl, newUrl } of renames) {
    // BlogPost.coverImage
    const blogPosts = await prisma.blogPost.findMany({ where: { coverImage: oldUrl } });
    for (const p of blogPosts) {
      await prisma.blogPost.update({ where: { id: p.id }, data: { coverImage: newUrl } });
      console.log(`  BlogPost "${p.slug}": coverImage updated`);
    }

    // Project.images (JSON array)
    const projects = await prisma.project.findMany();
    for (const p of projects) {
      if (p.images.includes(oldUrl)) {
        const updated = replaceUrl(p.images, oldUrl, newUrl);
        await prisma.project.update({ where: { id: p.id }, data: { images: updated } });
        console.log(`  Project "${p.slug}": images updated`);
      }
    }

    // Campaign fields that hold image URLs
    const campaigns = await prisma.campaign.findMany();
    for (const c of campaigns) {
      const fields = ['coverItems', 'extraItems'] as const;
      let changed = false;
      const data: Record<string, string> = {};
      for (const f of fields) {
        if (c[f].includes(oldUrl)) {
          data[f] = replaceUrl(c[f], oldUrl, newUrl);
          changed = true;
        }
      }
      if (changed) {
        await prisma.campaign.update({ where: { id: c.id }, data });
        console.log(`  Campaign "${c.slug}": image refs updated`);
      }
    }

    // Setting (logoUrl, faviconUrl, etc.)
    const settings = await prisma.setting.findMany({ where: { value: oldUrl } });
    for (const s of settings) {
      await prisma.setting.update({ where: { id: s.id }, data: { value: newUrl } });
      console.log(`  Setting "${s.key}": value updated`);
    }
  }

  // Step 3: delete originals
  console.log('\nDeleting original files...');
  for (const { oldPath, oldUrl } of renames) {
    fs.unlinkSync(oldPath);
    console.log(`  DELETED ${path.basename(oldPath)}`);
    void oldUrl; // already logged above
  }

  console.log('\nDone! Summary:');
  console.log(`  Converted: ${renames.length} file(s)`);
}

function kb(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)}KB`
    : `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
