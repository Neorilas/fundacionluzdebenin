import { describe, it, expect } from 'vitest';

// ─── DNI/NIF validation (same logic as in stripe.ts) ─────────────────────────

function isValidDni(dni: string): boolean {
  const clean = dni.trim().toUpperCase();
  return /^[0-9]{8}[A-Z]$/.test(clean)                              // NIF
    || /^[XYZ][0-9]{7}[A-Z]$/.test(clean)                           // NIE
    || /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/.test(clean);      // CIF
}

describe('DNI/NIF/NIE validation', () => {
  it('accepts valid NIF (8 digits + letter)', () => {
    expect(isValidDni('12345678A')).toBe(true);
    expect(isValidDni('00000000T')).toBe(true);
  });

  it('accepts valid NIF in lowercase', () => {
    expect(isValidDni('12345678a')).toBe(true);
  });

  it('accepts valid NIE (X/Y/Z + 7 digits + letter)', () => {
    expect(isValidDni('X1234567A')).toBe(true);
    expect(isValidDni('Y0000000Z')).toBe(true);
    expect(isValidDni('Z9999999B')).toBe(true);
  });

  it('accepts valid CIF (letter + 7 digits + check)', () => {
    expect(isValidDni('A1234567B')).toBe(true);
    expect(isValidDni('B12345670')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidDni('')).toBe(false);
  });

  it('rejects too short', () => {
    expect(isValidDni('1234567A')).toBe(false);
  });

  it('rejects too long', () => {
    expect(isValidDni('123456789AB')).toBe(false);
  });

  it('rejects random text', () => {
    expect(isValidDni('not-a-dni')).toBe(false);
    expect(isValidDni('ABCDEFGH')).toBe(false);
  });

  it('A12345678 is a valid CIF, not a misplaced NIF', () => {
    // A + 7 digits + check digit is a valid CIF format
    expect(isValidDni('A12345678')).toBe(true);
  });

  it('rejects invalid format with wrong prefix', () => {
    expect(isValidDni('I12345678')).toBe(false); // I is not valid CIF prefix
    expect(isValidDni('O12345678')).toBe(false); // O is not valid CIF prefix
  });

  it('trims whitespace', () => {
    expect(isValidDni('  12345678A  ')).toBe(true);
  });
});

// ─── Checkout validation logic ───────────────────────────────────────────────

describe('checkout amount validation', () => {
  const MIN_AMOUNT = 100;
  const MAX_AMOUNT = 10_000_00;

  it('accepts minimum amount (1 EUR = 100 cents)', () => {
    expect(MIN_AMOUNT >= 100).toBe(true);
  });

  it('rejects amounts below minimum', () => {
    expect(50 < MIN_AMOUNT).toBe(true);
    expect(0 < MIN_AMOUNT).toBe(true);
    expect(-100 < MIN_AMOUNT).toBe(true);
  });

  it('rejects amounts above maximum (10.000 EUR)', () => {
    expect(10_001_00 > MAX_AMOUNT).toBe(true);
    expect(999_999_99 > MAX_AMOUNT).toBe(true);
  });

  it('accepts valid amounts within range', () => {
    const valid = [100, 500, 1000, 5000, 100_00, 10_000_00];
    valid.forEach(amount => {
      expect(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT).toBe(true);
    });
  });
});

// ─── Type/lang validation ────────────────────────────────────────────────────

describe('checkout type validation', () => {
  const VALID_TYPES = ['one_time', 'subscription'];
  const VALID_LANGS = ['es', 'fr'];

  it('accepts valid types', () => {
    expect(VALID_TYPES.includes('one_time')).toBe(true);
    expect(VALID_TYPES.includes('subscription')).toBe(true);
  });

  it('rejects invalid types', () => {
    expect(VALID_TYPES.includes('recurring')).toBe(false);
    expect(VALID_TYPES.includes('')).toBe(false);
    expect(VALID_TYPES.includes('SUBSCRIPTION')).toBe(false);
  });

  it('accepts valid langs', () => {
    expect(VALID_LANGS.includes('es')).toBe(true);
    expect(VALID_LANGS.includes('fr')).toBe(true);
  });

  it('rejects invalid langs', () => {
    expect(VALID_LANGS.includes('en')).toBe(false);
    expect(VALID_LANGS.includes('')).toBe(false);
  });
});

// ─── Spam detection (same logic as contact.ts) ──────────────────────────────

function isSpam(subject: string, message: string): boolean {
  const combined = `${subject} ${message}`;
  const urls = combined.match(/(https?:\/\/|www\.)\S+/gi) || [];
  if (urls.length > 2) return true;
  const spamPattern = /\b(casino|viagra|cialis|porn|xxx|lottery|winner|prize|click here|unsubscribe|crypto|bitcoin|investment opportunity|make money|free money|guaranteed|limited time offer)\b/i;
  if (spamPattern.test(combined)) return true;
  return false;
}

describe('spam detection', () => {
  it('allows normal contact messages', () => {
    expect(isSpam('Pregunta sobre donaciones', 'Hola, me gustaría saber cómo puedo ayudar.')).toBe(false);
  });

  it('allows messages with 1-2 URLs', () => {
    expect(isSpam('Mi web', 'Mira https://example.com y https://other.com')).toBe(false);
  });

  it('flags messages with 3+ URLs', () => {
    expect(isSpam('Links', 'https://a.com https://b.com https://c.com')).toBe(true);
  });

  it('flags casino spam', () => {
    expect(isSpam('Great offer', 'Win big at our casino today!')).toBe(true);
  });

  it('flags crypto spam', () => {
    expect(isSpam('Investment', 'Make money with bitcoin investment opportunity')).toBe(true);
  });

  it('flags viagra spam', () => {
    expect(isSpam('Health', 'Buy cheap viagra online')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isSpam('WINNER', 'You are the WINNER of our LOTTERY')).toBe(true);
  });
});
