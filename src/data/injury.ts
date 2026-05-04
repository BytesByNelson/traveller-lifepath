import type { CareerId, Effect } from '../types';

/**
 * Injury 1D table. Each row first pushes a `gain_injury` so the wound is recorded on the
 * character's wounds list, then the actual stat reductions follow as `modify_char` /
 * `modify_char_choice` effects. The 1D rolls referenced in row 1 ("reduce one physical
 * by 1D") are surfaced as `note`s for the player to apply manually until phase 5
 * adds a roll-and-apply prompt.
 */
export type InjuryRow = {
  roll: number;
  text: string;
  effects: Effect[];
};

export const INJURY_TABLE: InjuryRow[] = [
  {
    roll: 1,
    text: 'Nearly killed — reduce one physical characteristic by 1D, reduce two other physical characteristics by 2.',
    effects: [
      {
        type: 'gain_injury',
        severity: 'nearly_killed',
        description: 'Nearly killed — one physical -1D, two others -2.',
      },
      { type: 'modify_char_choice_rolled', chars: ['STR', 'DEX', 'END'], dice: '1D', sign: 'minus' },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -2 },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -2 },
    ],
  },
  {
    roll: 2,
    text: 'Severely injured — reduce one physical characteristic by 1D.',
    effects: [
      { type: 'gain_injury', severity: 'severely_injured', description: 'Severely injured — one physical -1D.' },
      { type: 'modify_char_choice_rolled', chars: ['STR', 'DEX', 'END'], dice: '1D', sign: 'minus' },
    ],
  },
  {
    roll: 3,
    text: 'Missing Eye or Limb — reduce STR or DEX by 2.',
    effects: [
      { type: 'gain_injury', severity: 'missing_eye_or_limb', description: 'Missing eye or limb — STR or DEX -2.' },
      { type: 'modify_char_choice', chars: ['STR', 'DEX'], delta: -2 },
    ],
  },
  {
    roll: 4,
    text: 'Scarred — reduce any physical characteristic by 2.',
    effects: [
      { type: 'gain_injury', severity: 'scarred', description: 'Scarred — one physical -2.' },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -2 },
    ],
  },
  {
    roll: 5,
    text: 'Injured — reduce any physical characteristic by 1.',
    effects: [
      { type: 'gain_injury', severity: 'injured', description: 'Injured — one physical -1.' },
      { type: 'modify_char_choice', chars: ['STR', 'DEX', 'END'], delta: -1 },
    ],
  },
  {
    roll: 6,
    text: 'Lightly injured — no permanent effect.',
    effects: [
      { type: 'gain_injury', severity: 'lightly_injured', description: 'Lightly injured — no permanent effect.' },
    ],
  },
];

/** Cost in Cr to restore one point of a lost characteristic. */
export const RESTORE_CHAR_COST = 5000;

/** Medical Bills table — career group → coverage at roll thresholds. */
export type MedicalBillRow = {
  careers: CareerId[];
  coverage: { roll4Plus: number; roll8Plus: number; roll12Plus: number };
};

export const MEDICAL_BILLS: MedicalBillRow[] = [
  {
    careers: ['army', 'navy', 'marine'],
    coverage: { roll4Plus: 0.75, roll8Plus: 1.0, roll12Plus: 1.0 },
  },
  {
    careers: ['agent', 'noble', 'scholar', 'entertainer', 'merchant', 'citizen'],
    coverage: { roll4Plus: 0.5, roll8Plus: 0.75, roll12Plus: 1.0 },
  },
  {
    careers: ['scout', 'rogue', 'drifter'],
    coverage: { roll4Plus: 0, roll8Plus: 0.5, roll12Plus: 0.75 },
  },
];

/** Prisoner career has no medical bill coverage in the rulebook. */
