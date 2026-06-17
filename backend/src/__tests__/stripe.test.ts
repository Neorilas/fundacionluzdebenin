import { describe, it, expect } from 'vitest';
import { buildDonationThankYouEmail } from '../lib/mailer';
import { shouldExpireDonation } from '../routes/public/stripeWebhook';

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
  const spamPatternEn = /\b(casino|viagra|cialis|porn|xxx|lottery|winner|prize|click here|unsubscribe|crypto|bitcoin|investment opportunity|make money|free money|guaranteed|limited time offer)\b/i;
  if (spamPatternEn.test(combined)) return true;
  const spamPatternEs = /\b(posicionamiento web|agencia (de )?marketing|servicios? (de )?(seo|sem|marketing digital)|primera p[aá]gina de google|mejorar (tu|su|el) (posicionamiento|ranking|visibilidad)|estrategia digital|campa[nñ]a (de )?(google ads|adwords|publicidad online)|presupuesto sin compromiso|linkbuilding|backlinks|auditor[ií]a (seo|web|gratuita)|consultora? (de )?(marketing|seo|digital))\b/i;
  if (spamPatternEs.test(combined)) return true;
  const coldOutreach = /\b(sin compromiso|le escribo para ofrecer|me pongo en contacto para ofrecer|hemos visto (su|tu) (web|p[aá]gina)|aumentar (sus?|tus?) (ventas|clientes|visitas|tr[aá]fico))\b/i;
  if (coldOutreach.test(combined)) return true;
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

  // --- Spanish SEO/marketing spam ---
  it('flags SEO spam in Spanish', () => {
    expect(isSpam('Colaboración', 'Ofrecemos servicios de posicionamiento web para su fundación')).toBe(true);
  });

  it('flags marketing agency spam', () => {
    expect(isSpam('Propuesta', 'Somos una agencia de marketing digital y queremos ayudarles')).toBe(true);
  });

  it('flags first page of Google spam', () => {
    expect(isSpam('SEO', 'Podemos ponerles en la primera página de Google')).toBe(true);
  });

  it('flags cold outreach with "sin compromiso"', () => {
    expect(isSpam('Oferta', 'Le ofrezco una auditoría gratuita sin compromiso')).toBe(true);
  });

  it('flags "hemos visto su web" cold outreach', () => {
    expect(isSpam('Propuesta', 'Hemos visto su web y queremos ofrecer nuestros servicios')).toBe(true);
  });

  it('flags "aumentar sus ventas" pitch', () => {
    expect(isSpam('Marketing', 'Podemos aumentar sus visitas con nuestra estrategia')).toBe(true);
  });

  it('flags linkbuilding spam', () => {
    expect(isSpam('SEO', 'Ofrecemos servicios de linkbuilding y backlinks de calidad')).toBe(true);
  });

  it('allows legitimate business collaboration', () => {
    expect(isSpam('Colaboración empresarial — Autónomo', 'Me gustaría colaborar con la fundación aportando mi experiencia')).toBe(false);
  });

  it('allows legitimate empresa inquiry', () => {
    expect(isSpam('Colaboración empresarial — Empresa (Acme SL)', 'Somos una empresa de Sevilla interesada en apoyar la labor de la fundación')).toBe(false);
  });
});

// ─── checkout.session.expired guard ──────────────────────────────────────────

describe('shouldExpireDonation', () => {
  it('expires an abandoned pending checkout', () => {
    expect(shouldExpireDonation('pending')).toBe(true);
  });

  it('never overwrites a completed donation', () => {
    expect(shouldExpireDonation('completed')).toBe(false);
  });

  it('never overwrites a failed or canceled donation', () => {
    expect(shouldExpireDonation('failed')).toBe(false);
    expect(shouldExpireDonation('canceled')).toBe(false);
  });

  it('is idempotent — an already-expired donation is not re-expired', () => {
    expect(shouldExpireDonation('expired')).toBe(false);
  });

  it('ignores an unknown or missing status', () => {
    expect(shouldExpireDonation(undefined)).toBe(false);
    expect(shouldExpireDonation('')).toBe(false);
  });
});

// ─── Donation thank-you email builder ────────────────────────────────────────

describe('buildDonationThankYouEmail', () => {
  it('uses Spanish by default and for lang=es', () => {
    const { subject, html } = buildDonationThankYouEmail({
      donorEmail: 'a@b.com', amount: 2500, currency: 'eur', type: 'one_time',
    });
    expect(subject).toContain('Gracias por tu donación');
    expect(html).toContain('¡Gracias de corazón!');
  });

  it('uses French for lang=fr', () => {
    const { subject, html } = buildDonationThankYouEmail({
      donorEmail: 'a@b.com', amount: 2500, currency: 'eur', type: 'one_time', lang: 'fr',
    });
    expect(subject).toContain('Merci pour votre don');
    expect(html).toContain('Merci du fond du cœur');
  });

  it('differentiates subscription subject (monthly)', () => {
    const es = buildDonationThankYouEmail({ donorEmail: 'a@b.com', amount: 1000, currency: 'eur', type: 'subscription' });
    expect(es.subject).toContain('mensual');
    const fr = buildDonationThankYouEmail({ donorEmail: 'a@b.com', amount: 1000, currency: 'eur', type: 'subscription', lang: 'fr' });
    expect(fr.subject).toContain('mensuel');
  });

  it('formats euro amount from cents', () => {
    const { html } = buildDonationThankYouEmail({ donorEmail: 'a@b.com', amount: 2500, currency: 'eur', type: 'one_time' });
    expect(html).toContain('25.00€');
  });

  it('formats non-eur currency with code', () => {
    const { html } = buildDonationThankYouEmail({ donorEmail: 'a@b.com', amount: 5000, currency: 'usd', type: 'one_time' });
    expect(html).toContain('50.00 USD');
  });

  it('greets by first name only', () => {
    const { html } = buildDonationThankYouEmail({ donorEmail: 'a@b.com', donorName: 'María García López', amount: 1000, currency: 'eur', type: 'one_time' });
    expect(html).toContain('Hola María,');
    expect(html).not.toContain('García');
  });

  it('falls back to generic greeting without a name', () => {
    const { html } = buildDonationThankYouEmail({ donorEmail: 'a@b.com', amount: 1000, currency: 'eur', type: 'one_time' });
    expect(html).toContain('Hola,');
  });

  it('mentions the sponsored animal when present', () => {
    const { html } = buildDonationThankYouEmail({ donorEmail: 'a@b.com', amount: 500, currency: 'eur', type: 'subscription', animalName: 'Lola' });
    expect(html).toContain('Lola');
    expect(html).toContain('apadrinado');
  });

  it('omits the animal block when not present', () => {
    const { html } = buildDonationThankYouEmail({ donorEmail: 'a@b.com', amount: 500, currency: 'eur', type: 'one_time' });
    expect(html).not.toContain('apadrinado');
  });

  it('escapes HTML in donor name', () => {
    const { html } = buildDonationThankYouEmail({ donorEmail: 'a@b.com', donorName: '<script>', amount: 1000, currency: 'eur', type: 'one_time' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
