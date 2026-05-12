import type { CharCode } from './characteristics';

export type SpeciesId =
  | 'human'
  | 'aslan'
  | 'vargr'
  | 'solomani'
  | 'vilani'
  | 'sword_worlder'
  | 'bwap'
  | 'luriani'
  | 'jonkeereen';

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
  /** Where this species comes from — book/sourcebook/page. Shown on the
   *  species picker so players know we didn't make it up. */
  source?: string;
};
