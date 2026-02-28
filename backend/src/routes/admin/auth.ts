import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const router = Router();

// POST /api/admin/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña requeridos' });
      return;
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/auth/logout
router.post('/logout', (_req, res) => {
  res.json({ success: true });
});

// GET /api/admin/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.id } });
    if (!admin) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
