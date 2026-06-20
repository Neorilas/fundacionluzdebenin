import { describe, it, expect } from 'vitest';
import {
  isValidRole,
  normalizeRole,
  isFullAdmin,
  canViewDonations,
  DEFAULT_ROLE,
} from '../lib/roles';

describe('isValidRole', () => {
  it('accepts known roles', () => {
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('donations_viewer')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isValidRole('superuser')).toBe(false);
    expect(isValidRole('')).toBe(false);
    expect(isValidRole(undefined)).toBe(false);
    expect(isValidRole(null)).toBe(false);
    expect(isValidRole(42)).toBe(false);
  });
});

describe('normalizeRole', () => {
  it('keeps valid roles', () => {
    expect(normalizeRole('donations_viewer')).toBe('donations_viewer');
  });

  it('falls back to default for invalid/legacy tokens', () => {
    expect(normalizeRole(undefined)).toBe(DEFAULT_ROLE);
    expect(normalizeRole('garbage')).toBe(DEFAULT_ROLE);
    expect(DEFAULT_ROLE).toBe('admin');
  });
});

describe('isFullAdmin', () => {
  it('only admin has full access', () => {
    expect(isFullAdmin('admin')).toBe(true);
    expect(isFullAdmin('donations_viewer')).toBe(false);
  });

  it('treats legacy/unknown roles as admin (backward compat)', () => {
    expect(isFullAdmin(undefined)).toBe(true);
    expect(isFullAdmin('legacy')).toBe(true);
  });
});

describe('canViewDonations', () => {
  it('admin and donations_viewer can view donations', () => {
    expect(canViewDonations('admin')).toBe(true);
    expect(canViewDonations('donations_viewer')).toBe(true);
  });

  it('unknown roles normalize to admin and can view', () => {
    expect(canViewDonations('whatever')).toBe(true);
  });
});
