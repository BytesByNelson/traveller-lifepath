import type { CareerId } from '../types';

/** Pension by terms served — page 48. */
export const PENSION_TABLE: { terms: number; pay: number }[] = [
  { terms: 5, pay: 10000 },
  { terms: 6, pay: 12000 },
  { terms: 7, pay: 14000 },
  { terms: 8, pay: 16000 },
  // 9+: 16000 + 2000 per term beyond 8 — handled in computePension below.
];

export const PENSION_PER_TERM_BEYOND_8 = 2000;

/** Careers that do NOT pay a pension (page 48). */
export const NO_PENSION_CAREERS: CareerId[] = ['scout', 'rogue', 'prisoner', 'drifter'];

export function computePension(terms: number): number {
  if (terms < 5) return 0;
  if (terms <= 8) {
    return PENSION_TABLE.find((row) => row.terms === terms)?.pay ?? 0;
  }
  return 16000 + PENSION_PER_TERM_BEYOND_8 * (terms - 8);
}
