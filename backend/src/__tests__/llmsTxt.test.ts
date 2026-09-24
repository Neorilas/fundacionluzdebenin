import { describe, it, expect } from 'vitest';
import { buildLlmsTxt } from '../lib/llmsTxt';

const empty = { site: 'https://fundacionluzdebenin.org', projects: [], campaigns: [], posts: [] };

describe('buildLlmsTxt', () => {
  it('empieza con H1 y resumen en blockquote (formato llmstxt.org)', () => {
    const out = buildLlmsTxt(empty);
    const lines = out.split('\n');
    expect(lines[0]).toBe('# Fundación Luz de Benín');
    expect(lines[2].startsWith('> ')).toBe(true);
  });

  it('incluye las páginas principales con URL absoluta', () => {
    const out = buildLlmsTxt(empty);
    expect(out).toContain('- [Preguntas frecuentes](https://fundacionluzdebenin.org/es/faq/)');
    expect(out).toContain('(https://fundacionluzdebenin.org/es/colabora/)');
  });

  it('omite secciones vacías', () => {
    const out = buildLlmsTxt(empty);
    expect(out).not.toContain('## Proyectos');
    expect(out).not.toContain('## Blog');
    expect(out).not.toContain('## Campañas');
  });

  it('lista proyectos con descripción recortada en una sola línea', () => {
    const out = buildLlmsTxt({
      ...empty,
      projects: [{ slug: 'granja', titleEs: 'Granja', titleFr: 'Ferme', descEs: '## Granja\n\n' + 'huevos '.repeat(60) }],
    });
    const line = out.split('\n').find(l => l.includes('/es/proyectos/granja/'))!;
    expect(line.startsWith('- [Granja](https://fundacionluzdebenin.org/es/proyectos/granja/): Granja huevos')).toBe(true);
    expect(line.endsWith('…')).toBe(true);
  });

  it('prioriza la meta descripción manual del proyecto', () => {
    const out = buildLlmsTxt({
      ...empty,
      projects: [{ slug: 'g', titleEs: 'G', titleFr: 'G', descEs: 'Larga', metaDescEs: 'Manual' }],
    });
    expect(out).toContain('- [G](https://fundacionluzdebenin.org/es/proyectos/g/): Manual');
  });

  it('lista campañas y posts; sin descripción no añade ":"', () => {
    const out = buildLlmsTxt({
      ...empty,
      campaigns: [{ slug: 'apadrina-gallina', titleEs: 'Apadrina una gallina', titleFr: '', taglineEs: '' }],
      posts: [{ slug: 'post', titleEs: 'Post', titleFr: '', excerptEs: 'Extracto\ncon salto' }],
    });
    expect(out).toContain('- [Apadrina una gallina](https://fundacionluzdebenin.org/es/campanas/apadrina-gallina/)\n');
    expect(out).toContain('- [Post](https://fundacionluzdebenin.org/es/blog/post/): Extracto con salto');
  });

  it('normaliza la barra final del dominio', () => {
    const out = buildLlmsTxt({ ...empty, site: 'https://example.org/' });
    expect(out).toContain('(https://example.org/es/faq/)');
    expect(out).not.toContain('org//');
  });
});
