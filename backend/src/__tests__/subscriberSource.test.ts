import { describe, it, expect } from 'vitest';
import { resolveSubscriberSource, SUBSCRIBER_SOURCES } from '../lib/subscriberSource';

describe('resolveSubscriberSource', () => {
  it('acepta cada fuente válida tal cual', () => {
    for (const s of SUBSCRIBER_SOURCES) {
      expect(resolveSubscriberSource(s)).toBe(s);
    }
  });

  it('reconoce la fuente de la landing de captación', () => {
    expect(resolveSubscriberSource('landing')).toBe('landing');
  });

  it('normaliza mayúsculas y espacios', () => {
    expect(resolveSubscriberSource('  LANDING ')).toBe('landing');
    expect(resolveSubscriberSource('Newsletter')).toBe('newsletter');
  });

  it('cae a "newsletter" con valores desconocidos', () => {
    expect(resolveSubscriberSource('whatsapp')).toBe('newsletter');
    expect(resolveSubscriberSource('')).toBe('newsletter');
  });

  it('cae a "newsletter" con valores no string o ausentes', () => {
    expect(resolveSubscriberSource(undefined)).toBe('newsletter');
    expect(resolveSubscriberSource(null)).toBe('newsletter');
    expect(resolveSubscriberSource(123)).toBe('newsletter');
    expect(resolveSubscriberSource({})).toBe('newsletter');
  });
});
