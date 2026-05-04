import type { Effect } from '../types';

/** Aging table: net (2D - terms served) → effect. */
export type AgingRow = {
  /** The (2D - terms) total this row triggers on. */
  result: number | { atMost: number };
  text: string;
  effects: Effect[];
};

export const AGING_TABLE: AgingRow[] = [
  {
    result: { atMost: -6 },
    text: 'Reduce three physical characteristics by 2, reduce one mental characteristic by 1.',
    effects: [
      { type: 'modify_char', char: 'STR', delta: -2 },
      { type: 'modify_char', char: 'DEX', delta: -2 },
      { type: 'modify_char', char: 'END', delta: -2 },
      { type: 'modify_char_choice', chars: ['INT', 'EDU', 'SOC'], delta: -1 },
    ],
  },
  {
    result: -5,
    text: 'Reduce three physical characteristics by 2.',
    effects: [
      { type: 'modify_char', char: 'STR', delta: -2 },
      { type: 'modify_char', char: 'DEX', delta: -2 },
      { type: 'modify_char', char: 'END', delta: -2 },
    ],
  },
  {
    result: -4,
    text: 'Reduce two physical characteristics by 2, reduce one physical characteristic by 1.',
    effects: [
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -2 },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -2 },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 },
    ],
  },
  {
    result: -3,
    text: 'Reduce one physical characteristic by 2, reduce two physical characteristics by 1.',
    effects: [
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -2 },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 },
    ],
  },
  {
    result: -2,
    text: 'Reduce three physical characteristics by 1.',
    effects: [
      { type: 'modify_char', char: 'STR', delta: -1 },
      { type: 'modify_char', char: 'DEX', delta: -1 },
      { type: 'modify_char', char: 'END', delta: -1 },
    ],
  },
  {
    result: -1,
    text: 'Reduce two physical characteristics by 1.',
    effects: [
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 },
    ],
  },
  {
    result: 0,
    text: 'Reduce one physical characteristic by 1.',
    effects: [{ type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 }],
  },
  // 1+ → no effect, intentionally absent.
];

export const AGING_STARTS_AT_TERM = 4; // checked at end of 4th term (age 34)
export const AGING_AGE_THRESHOLD = 34;

/** Cost per term of anagathic drugs is 1D × Cr25,000. */
export const ANAGATHIC_COST_PER_TERM_BASE = 25000;
export const ANAGATHIC_QUALIFICATION_CHECK = { char: 'SOC' as const, target: 10 };
