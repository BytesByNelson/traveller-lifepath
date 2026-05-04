import type { CharCode } from './characteristics';

export type SpeciesId = 'human' | 'aslan' | 'vargr';

export type SpeciesTrait = {
  name: string;
  description: string;
};

export type Species = {
  id: SpeciesId;
  name: string;
  /** Modifiers applied to rolled characteristics (may push above 15 for aliens). */
  charModifiers: Partial<Record<CharCode, number>>;
  traits: SpeciesTrait[];
  description: string;
};
