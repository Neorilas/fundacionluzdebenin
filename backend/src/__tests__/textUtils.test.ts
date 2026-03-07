import { describe, it, expect } from 'vitest';
import { toSlug, makeChunks, stripMarkdown, countWords } from '../lib/textUtils';

// ─── toSlug ──────────────────────────────────────────────────────────────────

describe('toSlug', () => {
  it('converts a simple title to lowercase hyphenated slug', () => {
    expect(toSlug('Mi Proyecto')).toBe('mi-proyecto');
  });

  it('strips accents and special Spanish characters', () => {
    expect(toSlug('Educación en Benín')).toBe('educacion-en-benin');
    expect(toSlug('¿Cómo ayudamos?')).toBe('como-ayudamos');
    expect(toSlug('Niños y niñas')).toBe('ninos-y-ninas');
  });

  it('collapses multiple separators into a single hyphen', () => {
    expect(toSlug('Título -- con   espacios')).toBe('titulo-con-espacios');
  });

  it('strips leading and trailing hyphens', () => {
    expect(toSlug('  Hola mundo  ')).toBe('hola-mundo');
  });

  it('handles empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('handles numbers', () => {
    expect(toSlug('Informe 2025')).toBe('informe-2025');
  });
});

// ─── makeChunks ──────────────────────────────────────────────────────────────

describe('makeChunks', () => {
  it('returns the text as a single chunk when it fits', () => {
    expect(makeChunks('Hola mundo.')).toEqual(['Hola mundo.']);
  });

  it('returns exactly one chunk when text equals maxLen', () => {
    const text = 'a'.repeat(450);
    expect(makeChunks(text)).toHaveLength(1);
  });

  it('splits a long paragraph into multiple chunks each ≤ maxLen', () => {
    const sentences = Array.from({ length: 20 }, (_, i) => `Esta es la oración número ${i + 1} del texto de prueba.`);
    const text = sentences.join(' ');
    const chunks = makeChunks(text, 200);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach(c => expect(c.length).toBeLessThanOrEqual(200));
  });

  it('preserves all words across chunks (no words lost)', () => {
    const sentences = Array.from({ length: 10 }, (_, i) => `Oración ${i + 1}.`);
    const text = sentences.join(' ');
    const chunks = makeChunks(text, 50);
    const rejoined = chunks.join(' ');
    // Every original sentence should appear somewhere in the rejoined text
    sentences.forEach(s => expect(rejoined).toContain(s.split('.')[0]));
  });

  it('handles a single sentence longer than maxLen by truncating', () => {
    const longSentence = 'a'.repeat(600);
    const chunks = makeChunks(longSentence, 450);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    chunks.forEach(c => expect(c.length).toBeLessThanOrEqual(450));
  });

  it('returns the first 450 chars for a single word longer than maxLen', () => {
    const huge = 'x'.repeat(900);
    const chunks = makeChunks(huge, 450);
    expect(chunks[0].length).toBeLessThanOrEqual(450);
  });
});

// ─── stripMarkdown ───────────────────────────────────────────────────────────

describe('stripMarkdown', () => {
  it('removes headings', () => {
    expect(stripMarkdown('## Título principal')).toBe('Título principal');
  });

  it('removes bold and italic markers', () => {
    expect(stripMarkdown('**negrita** y _cursiva_')).toBe('negrita y cursiva');
  });

  it('removes image syntax and keeps nothing', () => {
    expect(stripMarkdown('Antes ![foto](http://example.com/img.jpg) después')).toBe('Antes  después'.trim());
  });

  it('removes link syntax but keeps link text', () => {
    expect(stripMarkdown('[visita nuestra web](https://fundacionluzdebenin.org)')).toBe('visita nuestra web');
  });

  it('removes fenced code blocks', () => {
    expect(stripMarkdown('Texto\n```\ncodigo\n```\nmás texto')).toContain('Texto');
    expect(stripMarkdown('Texto\n```\ncodigo\n```\nmás texto')).not.toContain('codigo');
  });

  it('returns empty string for empty input', () => {
    expect(stripMarkdown('')).toBe('');
  });
});

// ─── countWords ──────────────────────────────────────────────────────────────

describe('countWords', () => {
  it('counts words in plain text', () => {
    expect(countWords('uno dos tres')).toBe(3);
  });

  it('counts words ignoring markdown syntax', () => {
    // "## Título" → "Título" (1 word), "**hola** mundo" → "hola mundo" (2 words)
    expect(countWords('## Título\n**hola** mundo')).toBe(3);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for markdown-only content with no words', () => {
    expect(countWords('![](url)')).toBe(0);
  });

  it('does not count image URLs as words', () => {
    const md = 'Un párrafo de prueba.\n\n![descripción](https://example.com/img.webp)';
    const n = countWords(md);
    // should count "Un párrafo de prueba" (4) + "descripción" — but NOT the URL parts
    expect(n).toBeGreaterThanOrEqual(4);
    expect(n).toBeLessThan(10);
  });

  it('counts a realistic blog post excerpt', () => {
    const text = 'La Fundación Luz de Benín ayuda a cuatro orfanatos en la región de Cotonou. ' +
      'Nuestro objetivo es mejorar la educación y la salud de los niños más vulnerables. ' +
      'Cada aportación cuenta para lograr un futuro mejor.';
    expect(countWords(text)).toBeGreaterThan(30);
  });
});
