import { describe, it, expect } from 'vitest';
import {
  toMetaDescription, resolveMetaDescription, projectSeoDescriptions, META_DESC_MAX,
  buildSeoTitle, blogPostSeo, projectSeoTitles, campaignSeoDescriptions, TITLE_MAX,
} from '../lib/seo';

describe('toMetaDescription', () => {
  it('devuelve el texto tal cual si es corto', () => {
    expect(toMetaDescription('Granja avícola en Benín.')).toBe('Granja avícola en Benín.');
  });

  it('elimina sintaxis Markdown, viñetas y saltos de línea', () => {
    const md = '## Objetivo\n\nApoyamos **4 orfanatos** con [nuestra granja](/es/proyectos/granja/).\n\n- Huevos\n1. Huerto';
    expect(toMetaDescription(md)).toBe('Objetivo Apoyamos 4 orfanatos con nuestra granja. Huevos Huerto');
  });

  it('elimina etiquetas HTML', () => {
    expect(toMetaDescription('<p>Hola <strong>mundo</strong></p>')).toBe('Hola mundo');
  });

  it('trunca en límite de palabra, no supera el máximo y termina en …', () => {
    const long = 'palabra '.repeat(100);
    const out = toMetaDescription(long);
    expect(out.length).toBeLessThanOrEqual(META_DESC_MAX);
    expect(out.endsWith('palabra…')).toBe(true);
  });

  it('quita puntuación colgante antes de los puntos suspensivos', () => {
    const text = 'a'.repeat(140) + ', siguiente frase que no cabe en la descripción';
    const out = toMetaDescription(text);
    expect(out).toBe('a'.repeat(140) + ', siguiente…');
    expect(toMetaDescription('x'.repeat(145) + '. ' + 'y'.repeat(20))).toBe('x'.repeat(145) + '…');
  });

  it('corta en seco si no hay espacios razonables', () => {
    const out = toMetaDescription('x'.repeat(300));
    expect(out.length).toBe(META_DESC_MAX);
  });

  it('acepta un máximo personalizado', () => {
    expect(toMetaDescription('uno dos tres cuatro', 10)).toBe('uno dos…');
  });

  it('devuelve cadena vacía para texto vacío o nulo', () => {
    expect(toMetaDescription('')).toBe('');
    expect(toMetaDescription(undefined as unknown as string)).toBe('');
  });
});

describe('resolveMetaDescription', () => {
  it('prioriza la meta descripción manual', () => {
    expect(resolveMetaDescription('Manual', 'Cuerpo largo')).toBe('Manual');
  });

  it('ignora la manual si está vacía o en blanco', () => {
    expect(resolveMetaDescription('   ', 'Cuerpo')).toBe('Cuerpo');
    expect(resolveMetaDescription(null, 'Cuerpo')).toBe('Cuerpo');
  });

  it('también limita la manual al máximo', () => {
    expect(resolveMetaDescription('m '.repeat(200), '').length).toBeLessThanOrEqual(META_DESC_MAX);
  });
});

describe('projectSeoDescriptions', () => {
  it('genera ambas descripciones desde el cuerpo', () => {
    expect(projectSeoDescriptions({ descEs: 'Hola', descFr: 'Bonjour' })).toEqual({ seoDescEs: 'Hola', seoDescFr: 'Bonjour' });
  });

  it('usa las manuales si existen', () => {
    expect(projectSeoDescriptions({ descEs: 'Hola', descFr: 'Bonjour', metaDescEs: 'ES', metaDescFr: 'FR' }))
      .toEqual({ seoDescEs: 'ES', seoDescFr: 'FR' });
  });

  it('el francés cae al español si está vacío', () => {
    expect(projectSeoDescriptions({ descEs: 'Hola', descFr: '' })).toEqual({ seoDescEs: 'Hola', seoDescFr: 'Hola' });
  });
});

describe('buildSeoTitle', () => {
  it('añade la marca si cabe en 60 caracteres', () => {
    expect(buildSeoTitle('Granja Avícola Sostenible', 'es')).toBe('Granja Avícola Sostenible | Fundación Luz de Benín');
    expect(buildSeoTitle('Ferme Avicole Durable', 'fr')).toBe('Ferme Avicole Durable | Fondation Lumière du Bénin');
  });

  it('omite la marca si el resultado superaría el máximo', () => {
    const t = 'Inauguramos la Escuela Primaria de Akpakpa';
    expect(buildSeoTitle(t, 'es')).toBe(t);
    expect(`${t} | Fundación Luz de Benín`.length).toBeGreaterThan(TITLE_MAX);
  });

  it('no duplica la marca si ya está en el título', () => {
    expect(buildSeoTitle('Preguntas frecuentes — Fundación Luz de Benín', 'es')).toBe('Preguntas frecuentes — Fundación Luz de Benín');
  });

  it('devuelve la marca si el título está vacío y normaliza espacios', () => {
    expect(buildSeoTitle('', 'fr')).toBe('Fondation Lumière du Bénin');
    expect(buildSeoTitle('  Hola   mundo ', 'es')).toBe('Hola mundo | Fundación Luz de Benín');
  });
});

describe('blogPostSeo', () => {
  const post = {
    titleEs: 'Título', titleFr: 'Titre', metaTitleEs: '', metaTitleFr: '',
    excerptEs: 'Extracto', excerptFr: 'Extrait', contentEs: '<p>Contenido</p>', contentFr: '<p>Contenu</p>',
  };

  it('usa título y extracto por defecto', () => {
    expect(blogPostSeo(post)).toEqual({
      seoTitleEs: 'Título | Fundación Luz de Benín', seoTitleFr: 'Titre | Fondation Lumière du Bénin',
      seoDescEs: 'Extracto', seoDescFr: 'Extrait',
    });
  });

  it('prioriza el meta título', () => {
    expect(blogPostSeo({ ...post, metaTitleEs: 'Meta ES' }).seoTitleEs).toBe('Meta ES | Fundación Luz de Benín');
  });

  it('recorta extractos largos y usa el contenido si no hay extracto', () => {
    const r = blogPostSeo({ ...post, excerptEs: 'x '.repeat(200), excerptFr: '' });
    expect(r.seoDescEs.length).toBeLessThanOrEqual(META_DESC_MAX);
    expect(r.seoDescFr).toBe('Contenu');
  });

  it('el francés cae al español si todo está vacío', () => {
    const r = blogPostSeo({ ...post, titleFr: '', excerptFr: '', contentFr: '' });
    expect(r.seoTitleFr).toBe('Título | Fondation Lumière du Bénin');
    expect(r.seoDescFr).toBe('Extracto');
  });
});

describe('projectSeoTitles', () => {
  it('usa el título español si falta el francés', () => {
    expect(projectSeoTitles({ titleEs: 'Contenedores', titleFr: '' })).toEqual({
      seoTitleEs: 'Contenedores | Fundación Luz de Benín',
      seoTitleFr: 'Contenedores | Fondation Lumière du Bénin',
    });
  });
});

describe('campaignSeoDescriptions', () => {
  it('limita la meta descripción manual y cae al tagline', () => {
    const r = campaignSeoDescriptions({ metaDescEs: 'palabra '.repeat(40), metaDescFr: '', taglineEs: '', taglineFr: 'Slogan' });
    expect(r.seoDescEs.length).toBeLessThanOrEqual(META_DESC_MAX);
    expect(r.seoDescFr).toBe('Slogan');
  });
});
