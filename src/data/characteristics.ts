import type { CharCode } from '../types';

/** Rulebook DM table: score → DM. */
export const CHAR_DM_TABLE: { range: [number, number]; dm: number }[] = [
  { range: [0, 0], dm: -3 },
  { range: [1, 2], dm: -2 },
  { range: [3, 5], dm: -1 },
  { range: [6, 8], dm: 0 },
  { range: [9, 11], dm: 1 },
  { range: [12, 14], dm: 2 },
  { range: [15, 99], dm: 3 },
];

export const characteristicDM = (score: number): number => {
  if (score <= 0) return -3;
  for (const row of CHAR_DM_TABLE) {
    if (score >= row.range[0] && score <= row.range[1]) return row.dm;
  }
  return 3;
};

export const CHAR_NAMES: Record<CharCode, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  END: 'Endurance',
  INT: 'Intellect',
  EDU: 'Education',
  SOC: 'Social Standing',
};
