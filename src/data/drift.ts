import type { CareerId } from '../types';

/** Draft 1D table — pages 19. */
export type DraftRow = {
  roll: number;
  career: CareerId;
  /** Forced assignment, when the rulebook specifies one (e.g. Merchant → merchant marine, Agent → law enforcement). */
  assignment?: string;
  /** When 'any', player picks the assignment in that career. */
  any?: boolean;
};

export const DRAFT_TABLE: DraftRow[] = [
  { roll: 1, career: 'navy', any: true },
  { roll: 2, career: 'army', any: true },
  { roll: 3, career: 'marine', any: true },
  { roll: 4, career: 'merchant', assignment: 'merchant_marine' },
  { roll: 5, career: 'scout', any: true },
  { roll: 6, career: 'agent', assignment: 'law_enforcement' },
];
