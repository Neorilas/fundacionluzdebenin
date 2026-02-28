import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/settings
router.get('/', async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj: Record<string, string> = {};
    for (const s of settings) { obj[s.key] = s.value; }
    res.json(obj);
  } catch (error) { next(error); }
});

// PUT /api/admin/settings/:key
router.put('/:key', async (req, res, next) => {
  try {
    const { value } = req.body;
    const setting = await prisma.setting.upsert({
      where: { key: req.params.key },
      update: { value },
      create: { key: req.params.key, value },
    });
    res.json(setting);
  } catch (error) { next(error); }
});

// PUT /api/admin/settings (bulk update)
router.put('/', async (req, res, next) => {
  try {
    const updates: Record<string, string> = req.body;
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      results.push(setting);
    }
    res.json(results);
  } catch (error) { next(error); }
});

// PUT /api/admin/settings/account/password
router.put('/account/password', async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await prisma.adminUser.findUnique({ where: { id: req.adminId } });
    if (!admin) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) { res.status(400).json({ error: 'Contraseña actual incorrecta' }); return; }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({ where: { id: req.adminId }, data: { passwordHash } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
