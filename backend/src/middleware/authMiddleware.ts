import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { normalizeRole, isFullAdmin, Role } from '../lib/roles';

export interface AuthRequest extends Request {
  adminId?: string;
  adminEmail?: string;
  adminRole?: Role;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado. Token requerido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: string;
      email: string;
      role?: string;
    };
    req.adminId = decoded.id;
    req.adminEmail = decoded.email;
    req.adminRole = normalizeRole(decoded.role);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

// Bloquea a usuarios sin acceso completo (p. ej. donations_viewer).
// Debe montarse SIEMPRE después de authMiddleware.
export function requireFullAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!isFullAdmin(req.adminRole)) {
    res.status(403).json({ error: 'Acceso restringido.' });
    return;
  }
  next();
}
