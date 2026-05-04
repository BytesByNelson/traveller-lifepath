import type { TaskDifficulty } from './skills';

/**
 * The five canonical psionic talents from the Psionics chapter. Each is a
 * SkillName as well, so a Traveller's level in (e.g.) Telepathy is stored on
 * `Character.backgroundSkills` like any other skill.
 */
export type PsionicTalentId =
  | 'telepathy'
  | 'clairvoyance'
  | 'telekinesis'
  | 'awareness'
  | 'teleportation';

/** Range bands for psionic powers (Psionic Range table p.229). */
export type PsionicRange =
  | 'personal'
  | 'close'
  | 'short'
  | 'medium'
  | 'long'
  | 'very_long'
  | 'distant'
  | 'very_distant'
  | 'continental'
  | 'planetary';

/** A specific psionic power belonging to a talent. */
export type PsionicPower = {
  id: string;
  name: string;
  talent: PsionicTalentId;
  /** Difficulty band for the activation check. */
  difficulty: TaskDifficulty;
  /** Reach band — the distance the power normally reaches. */
  range: PsionicRange;
  /** PSI cost on success. Failed activations always cost 1. */
  psiCost: number;
  /** Damage expression where applicable, e.g. "Effect ×3" for Assault. */
  damage?: string;
  /** Free-text rules description. */
  description: string;
  /** Timeframe expression, e.g. "1D × 10 seconds". */
  timeframe: string;
};

/** Psionic Training table — DMs for learning each talent. */
export type TalentLearningDM = {
  talent: PsionicTalentId;
  baseDM: number;
};

/** Range table mapping band to a human-readable distance. */
export const PSIONIC_RANGE_LABELS: Record<PsionicRange, string> = {
  personal: 'Personal (< 1 m)',
  close: 'Close (1–5 m)',
  short: 'Short (6–10 m)',
  medium: 'Medium (11–50 m)',
  long: 'Long (51–250 m)',
  very_long: 'Very Long (251–500 m)',
  distant: 'Distant (501 m – 5 km)',
  very_distant: 'Very Distant (6–500 km)',
  continental: 'Continental (501–5,000 km)',
  planetary: 'Planetary (5,001–50,000 km)',
};

export const TALENT_NAMES: Record<PsionicTalentId, string> = {
  telepathy: 'Telepathy',
  clairvoyance: 'Clairvoyance',
  telekinesis: 'Telekinesis',
  awareness: 'Awareness',
  teleportation: 'Teleportation',
};

/** Per-talent learning DMs from the Psionic Training table (p.228). */
export const TALENT_LEARNING_DMS: TalentLearningDM[] = [
  { talent: 'telepathy', baseDM: 4 },
  { talent: 'clairvoyance', baseDM: 3 },
  { talent: 'telekinesis', baseDM: 2 },
  { talent: 'awareness', baseDM: 1 },
  { talent: 'teleportation', baseDM: 0 },
];
