import { describe, it, expect } from 'vitest';
import { toSlug, makeChunks, stripMarkdown, countWords, htmlToMarkdown, looksLikeHtml } from '../lib/textUtils';

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

// ─── looksLikeHtml ───────────────────────────────────────────────────────────

describe('looksLikeHtml', () => {
  it('detects block and inline tags', () => {
    expect(looksLikeHtml('<p>Hola</p>')).toBe(true);
    expect(looksLikeHtml('Linea uno<br>Linea dos')).toBe(true);
    expect(looksLikeHtml('<STRONG>Ojo</STRONG>')).toBe(true);
  });

  it('does not flag plain text or Markdown', () => {
    expect(looksLikeHtml('Texto normal con < y > sueltos')).toBe(false);
    expect(looksLikeHtml('## Titulo\n\n- uno\n- dos\n\n**negrita**')).toBe(false);
    expect(looksLikeHtml('Ganamos 5 < 10 puntos')).toBe(false);
  });
});

// ─── htmlToMarkdown ──────────────────────────────────────────────────────────

describe('htmlToMarkdown', () => {
  it('leaves Markdown and plain text untouched', () => {
    const md = '## Titulo\n\nUn parrafo con **negrita**.\n\n- uno\n- dos';
    expect(htmlToMarkdown(md)).toBe(md);
    expect(htmlToMarkdown('')).toBe('');
  });

  it('converts paragraphs into blank-line separated blocks', () => {
    expect(htmlToMarkdown('<p>Primero</p><p>Segundo</p>')).toBe('Primero\n\nSegundo');
  });

  it('drops the empty paragraphs the editor leaves behind', () => {
    expect(htmlToMarkdown('<p>Uno</p><p></p><p>Dos</p><p></p>')).toBe('Uno\n\nDos');
  });

  it('turns <br> into a paragraph break so Markdown keeps it', () => {
    // A single "\n" would collapse when react-markdown renders the field.
    expect(htmlToMarkdown('<p>Uno<br>Dos</p>')).toBe('Uno\n\nDos');
    expect(htmlToMarkdown('<p>Uno<br /><br/>Dos</p>')).toBe('Uno\n\nDos');
  });

  it('maps inline formatting to Markdown', () => {
    expect(htmlToMarkdown('<p><strong>Negrita</strong> y <em>cursiva</em></p>')).toBe('**Negrita** y *cursiva*');
    expect(htmlToMarkdown('<p><b>B</b> y <i>I</i></p>')).toBe('**B** y *I*');
  });

  it('maps headings to Markdown headings', () => {
    expect(htmlToMarkdown('<h2>Nuestro proyecto</h2><p>Texto</p>')).toBe('## Nuestro proyecto\n\nTexto');
  });

  it('maps unordered and ordered lists', () => {
    expect(htmlToMarkdown('<ul><li>Uno</li><li>Dos</li></ul>')).toBe('- Uno\n- Dos');
    expect(htmlToMarkdown('<ol><li>Uno</li><li>Dos</li></ol>')).toBe('1. Uno\n2. Dos');
  });

  it('maps links and images', () => {
    expect(htmlToMarkdown('<p>Ver <a href="/es/proyectos/">proyectos</a></p>')).toBe('Ver [proyectos](/es/proyectos/)');
    expect(htmlToMarkdown('<p><img src="/uploads/a.webp" alt="Granja"></p>')).toBe('![Granja](/uploads/a.webp)');
  });

  it('decodes HTML entities', () => {
    expect(htmlToMarkdown('<p>Ni&ntilde;os &amp; ni&ntilde;as&nbsp;de Ben&iacute;n</p>')).toBe('Niños & niñas de Benín');
    expect(htmlToMarkdown('<p>Comillas &quot;asi&quot; y &#191;que tal?</p>')).toBe('Comillas "asi" y ¿que tal?');
  });

  it('strips unknown tags and never leaks scripts', () => {
    expect(htmlToMarkdown('<p>Hola <span class="x">mundo</span></p>')).toBe('Hola mundo');
    expect(htmlToMarkdown('<p>Seguro</p><script>alert(1)</script>')).toBe('Seguro');
  });

  it('normalises the real "contenedor" project description', () => {
    const stored = '<p>En estos dos anos hemos enviado un contenedor de ayuda anual.</p><p></p><p>Ahora compramos todo en la zona, generando riqueza local.</p><p></p>';
    expect(htmlToMarkdown(stored)).toBe(
      'En estos dos anos hemos enviado un contenedor de ayuda anual.\n\nAhora compramos todo en la zona, generando riqueza local.'
    );
  });

  it('is idempotent — running it twice changes nothing', () => {
    const once = htmlToMarkdown('<h2>Titulo</h2><p><strong>Uno</strong></p><ul><li>A</li></ul>');
    expect(htmlToMarkdown(once)).toBe(once);
  });
});
