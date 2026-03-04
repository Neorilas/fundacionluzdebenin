import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/users
router.get('/', async (_req: AuthRequest, res: Response, next) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users
router.post('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Ya existe un administrador con ese email' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.adminUser.create({
      data: { name, email, passwordHash },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    if (id === req.adminId) {
      res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
      return;
    }

    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    await prisma.adminUser.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
