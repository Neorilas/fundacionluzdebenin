import { Lang } from './types';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

const locales = { es, fr } as const;

export function t(lang: Lang, key: string): string {
  const keys = key.split('.');
  let obj: Record<string, unknown> = locales[lang] as unknown as Record<string, unknown>;
  for (const k of keys) {
    if (obj && typeof obj === 'object' && k in obj) {
      obj = obj[k] as Record<string, unknown>;
    } else {
      // Fallback to ES
      let fallback: Record<string, unknown> = locales.es as unknown as Record<string, unknown>;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk] as Record<string, unknown>;
        } else return key;
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }
  return typeof obj === 'string' ? obj : key;
}

export function getLangLabel(lang: Lang): string {
  return lang === 'es' ? 'Español' : 'Français';
}

export function getOtherLang(lang: Lang): Lang {
  return lang === 'es' ? 'fr' : 'es';
}

export const LANGS: Lang[] = ['es', 'fr'];

export function isValidLang(lang: string): lang is Lang {
  return LANGS.includes(lang as Lang);
}
