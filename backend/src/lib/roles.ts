// Roles de usuarios del panel de administración.
// - admin: acceso completo al panel.
// - donations_viewer: solo puede consultar el historial de donaciones.

export const ROLES = ['admin', 'donations_viewer'] as const;
export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = 'admin';

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

// Normaliza un rol desconocido (tokens antiguos, valores corruptos) a admin
// para mantener compatibilidad hacia atrás.
export function normalizeRole(value: unknown): Role {
  return isValidRole(value) ? value : DEFAULT_ROLE;
}

export function isFullAdmin(role: unknown): boolean {
  return normalizeRole(role) === 'admin';
}

export function canViewDonations(role: unknown): boolean {
  const r = normalizeRole(role);
  return r === 'admin' || r === 'donations_viewer';
}
