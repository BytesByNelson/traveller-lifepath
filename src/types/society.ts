/**
 * Societies / interstellar polities. A character's society is a setting-level
 * affiliation that gates which careers are available — Solomani Party recruits
 * from the Solomani Confederation only, Aslan Spirit Singer from the Hierate,
 * etc. Core careers (Agent, Army, Citizen, …) have no society restriction.
 *
 * v1 is data-only: the societies are defined here, Character.society holds
 * the player's affiliation, and Career.availableInSocieties? filters the
 * picker. Faction-specific career data tables are a separate scaffold.
 */
export type SocietyId =
  | 'third_imperium'
  | 'solomani_confederation'
  | 'aslan_hierate'
  | 'hiver_federation'
  | 'zhodani_consulate'
  | 'two_thousand_worlds'
  | 'vargr_extents'
  | 'other';

export type Society = {
  id: SocietyId;
  name: string;
  description: string;
  source?: string;
};
