import { describe, it, expect } from 'vitest';
import { buildPublicProjectWhere, isPubliclyVisible } from '../lib/projectVisibility';

describe('buildPublicProjectWhere', () => {
  it('siempre filtra por published: true', () => {
    expect(buildPublicProjectWhere()).toEqual({ published: true });
    expect(buildPublicProjectWhere({})).toEqual({ published: true });
  });

  it('añade el filtro de status cuando llega por query', () => {
    expect(buildPublicProjectWhere({ status: 'planned' })).toEqual({
      published: true,
      status: 'planned',
    });
  });

  it('ignora status vacío o no textual', () => {
    expect(buildPublicProjectWhere({ status: '' })).toEqual({ published: true });
    expect(buildPublicProjectWhere({ status: ['a', 'b'] })).toEqual({ published: true });
  });

  it('solo filtra featured con el string "true"', () => {
    expect(buildPublicProjectWhere({ featured: 'true' })).toEqual({ published: true, featured: true });
    expect(buildPublicProjectWhere({ featured: 'false' })).toEqual({ published: true });
    expect(buildPublicProjectWhere({ featured: true })).toEqual({ published: true });
  });

  it('no se puede desactivar el filtro de published desde la query', () => {
    const where = buildPublicProjectWhere({ status: 'active', featured: 'true' } as Record<string, unknown>);
    expect(where.published).toBe(true);
  });
});

describe('isPubliclyVisible', () => {
  it('acepta solo proyectos publicados', () => {
    expect(isPubliclyVisible({ published: true })).toBe(true);
    expect(isPubliclyVisible({ published: false })).toBe(false);
  });

  it('trata null/undefined como no visible', () => {
    expect(isPubliclyVisible(null)).toBe(false);
    expect(isPubliclyVisible(undefined)).toBe(false);
    expect(isPubliclyVisible({})).toBe(false);
    expect(isPubliclyVisible({ published: null })).toBe(false);
  });
});
