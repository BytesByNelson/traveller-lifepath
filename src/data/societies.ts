import type { Society, SocietyId } from '../types/society';

/**
 * Society catalogue. Order is the picker order — Third Imperium first
 * (the default setting), then the major rival polities, then "Other" as
 * the catch-all for homebrew / fringe.
 */
export const SOCIETIES: Record<SocietyId, Society> = {
  third_imperium: {
    id: 'third_imperium',
    name: 'Third Imperium',
    description:
      'The default Traveller setting — a sprawling, polyglot empire of 11,000 worlds bound by jump-2 trade routes and the iron Imperial Mandate. Most published careers assume Imperial citizens.',
    source: 'Mongoose Traveller 2022 Core Rulebook',
  },
  solomani_confederation: {
    id: 'solomani_confederation',
    name: 'Solomani Confederation',
    description:
      'A breakaway human polity centred on Terra. Tightly nationalist, ideologically committed to Solomani heritage. Unique careers (Solomani Party, SolSec, Star Marines) reflect the Confederation\'s political and military structure.',
    source: 'Mongoose Traveller — Solomani Confederation sourcebook',
  },
  aslan_hierate: {
    id: 'aslan_hierate',
    name: 'Aslan Hierate / Glorious Empire',
    description:
      'The territory of the Aslan species: thousands of feuding clans bound by honour-codes and territorial expansion. Career options skew toward warrior, hunter, and clan-administrative roles.',
    source: 'Aliens of Charted Space Vol. 1, Mongoose Publishing',
  },
  hiver_federation: {
    id: 'hiver_federation',
    name: 'Hiver Federation',
    description:
      'A loose union dominated by the manipulative, six-limbed Hivers. Member species (including humans) operate under Hiver social engineering. Includes the Philosopher-Elder career and other Hiver-specific paths.',
    source: 'Mongoose Traveller — Hiver Federation sourcebook',
  },
  zhodani_consulate: {
    id: 'zhodani_consulate',
    name: 'Zhodani Consulate',
    description:
      'A psionic human polity ruled by telepathic nobility. Citizens accept regular mental review as a civic duty. Distinct career tracks for Intendants, Proles, and psionic specialists.',
    source: 'Mongoose Traveller — Zhodani Consulate sourcebook',
  },
  two_thousand_worlds: {
    id: 'two_thousand_worlds',
    name: 'Two Thousand Worlds',
    description:
      'The xenophobic, militant herd-empire of the K\'kree. Strict vegetarian by biology and creed; sees most carnivorous species as inherently wrong. Human members are typically herd-adapted and culturally distinct.',
    source: 'Mongoose Traveller — K\'Kree sourcebook',
  },
  vargr_extents: {
    id: 'vargr_extents',
    name: 'Vargr Extents',
    description:
      'A patchwork of Vargr-dominated polities, packs, and pirate domains. No central authority — charisma-driven leadership, fluid borders, frequent realignment. Mixed-species crews are common.',
    source: 'Aliens of Charted Space Vol. 1, Mongoose Publishing',
  },
  other: {
    id: 'other',
    name: 'Other / Far Domains',
    description:
      'Pocket empires, fringe polities, the deep periphery, or any homebrew setting. No restrictions on career choice — useful for campaigns outside Charted Space.',
  },
};
