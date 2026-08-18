/**
 * Reglas de visibilidad pública de los proyectos.
 *
 * Un proyecto solo aparece en la web si `published` es true. El campo `status`
 * (active/completed/planned) describe la fase del proyecto, no si está
 * publicado: un proyecto puede estar en fase `planned` y ser público, o estar
 * `active` y seguir siendo un borrador interno.
 */

export interface PublicProjectQuery {
  status?: unknown;
  featured?: unknown;
}

/** Construye el `where` de Prisma para el listado público. */
export function buildPublicProjectWhere(query: PublicProjectQuery = {}): Record<string, unknown> {
  const where: Record<string, unknown> = { published: true };
  if (typeof query.status === 'string' && query.status) where.status = query.status;
  if (query.featured === 'true') where.featured = true;
  return where;
}

/** True si el proyecto puede servirse por la API pública (type guard: descarta null). */
export function isPubliclyVisible<T extends { published?: boolean | null }>(
  project: T | null | undefined,
): project is T {
  return !!project && project.published === true;
}
