import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/contacts
router.get('/', async (_req, res, next) => {
  try {
    const contacts = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error) { next(error); }
});

// GET /api/admin/contacts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const contact = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!contact) { res.status(404).json({ error: 'Mensaje no encontrado' }); return; }

    // Auto-mark as read when viewed
    if (!contact.read) {
      await prisma.contactMessage.update({ where: { id: req.params.id }, data: { read: true } });
    }
    res.json({ ...contact, read: true });
  } catch (error) { next(error); }
});

// PUT /api/admin/contacts/:id/read
router.put('/:id/read', async (req, res, next) => {
  try {
    const { read } = req.body;
    const contact = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: read !== false },
    });
    res.json(contact);
  } catch (error) { next(error); }
});

// DELETE /api/admin/contacts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
