import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// POST /api/contact
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    res.status(201).json({ success: true, id: contact.id });
  } catch (error) {
    next(error);
  }
});

export default router;
