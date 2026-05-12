import type { Species, SpeciesId } from '../types';

/**
 * Species roster. Stat modifiers and traits transcribed from Mongoose Traveller
 * 2022 core + the Aliens of Charted Space sourcebooks. Each entry carries a
 * `source` string for attribution — credit where due and a defence against
 * "did you just make this up?" questions.
 *
 * Human-variant species (Solomani, Vilani, Sword Worlder) share the baseline
 * Human stat profile because the rulebook treats them as cultural — not
 * biological — distinctions. They're tracked separately so character lore /
 * homeworld / name generation can be flavoured appropriately later.
 */
export const SPECIES: Record<SpeciesId, Species> = {
  human: {
    id: 'human',
    name: 'Human',
    charModifiers: {},
    traits: [],
    description: 'Baseline Imperial human Traveller — adaptable, ubiquitous, defined by background more than biology.',
    source: 'Mongoose Traveller 2022 Core Rulebook',
  },
  aslan: {
    id: 'aslan',
    name: 'Aslan',
    charModifiers: { STR: +2, DEX: -2 },
    traits: [
      {
        name: 'Dewclaw',
        description:
          'A retractable dewclaw that doubles as a close-combat weapon. Uses Melee (natural); 1D+2 damage.',
      },
      {
        name: 'Heightened Senses',
        description:
          'Better night vision, hearing, and sense of smell. DM+1 to Recon and Survival checks.',
      },
    ],
    description:
      'An expansionist species of feuding clans and predatory warriors descended from carnivorous pouncer stock.',
    source: 'Mongoose Traveller 2022 Core Rulebook; Aliens of Charted Space Vol. 1',
  },
  vargr: {
    id: 'vargr',
    name: 'Vargr',
    charModifiers: { STR: -1, DEX: +1, END: -1 },
    traits: [
      {
        name: 'Bite',
        description: 'Pronounced canines. Uses Melee (natural); 1D+1 damage.',
      },
      {
        name: 'Heightened Senses (Vargr)',
        description:
          'Better hearing and sense of smell. DM+1 to Recon and Survival checks. However, eyesight is worse in darkness — DM-1 to sight-based checks in dark conditions.',
      },
    ],
    description:
      'Genetically engineered from canine stock by the Ancients; a culture fueled by charisma, conflict, and pack loyalty.',
    source: 'Mongoose Traveller 2022 Core Rulebook; Aliens of Charted Space Vol. 1',
  },

  /* ─────────── Human cultures ─────────── */
  solomani: {
    id: 'solomani',
    name: 'Solomani Human',
    // Stat-equivalent to baseline Human per RAW — cultural distinction only.
    charModifiers: {},
    traits: [
      {
        name: 'Solomani Heritage',
        description:
          'Descended from the original humans of Terra. Treated as full citizens within the Solomani Confederation and as exotics or rivals everywhere else.',
      },
    ],
    description:
      'Humans of Terran heritage — proud, sometimes insular, deeply tied to the Solomani Confederation and its political legacy.',
    source: 'Mongoose Traveller — Solomani Confederation sourcebook',
  },
  vilani: {
    id: 'vilani',
    name: 'Vilani Human',
    charModifiers: {},
    traits: [
      {
        name: 'Vilani Tradition',
        description:
          'Inheritors of the First Imperium\'s culture: guild-bound trade, ritualised hierarchy, and an instinctive deference to lineage and bureau.',
      },
    ],
    description:
      'Humans descended from the Vilani founders of the First Imperium. Conservative, mercantile, deeply structured by caste and bureau.',
    source: 'Mongoose Traveller 2022 Core Rulebook',
  },
  sword_worlder: {
    id: 'sword_worlder',
    name: 'Sword Worlder',
    charModifiers: {},
    traits: [
      {
        name: 'Frontier Hardiness',
        description:
          'Sword Worlders grow up on rough, lightly-policed frontier worlds. Cultural conditioning toward independence, weapons familiarity, and a low tolerance for Imperial bureaucracy.',
      },
    ],
    description:
      'Humans of the Sword Worlds Confederation: fiercely independent frontier folk with a martial culture and a long-standing grudge against the Imperium.',
    source: 'Mongoose Traveller — Spinward Marches sourcebook',
  },

  /* ─────────── Alien races (stat-distinct) ─────────── */
  bwap: {
    id: 'bwap',
    name: 'Bwap',
    charModifiers: { STR: -1, END: -1, EDU: +2 },
    traits: [
      {
        name: 'Amphibious',
        description:
          'Bwap need to keep their skin damp. Without regular access to water they suffer Endurance loss; they are excellent swimmers and breathe atmospherically when moist.',
      },
      {
        name: 'Meticulous',
        description:
          'Cultural and biological preference for precise procedure and documentation. DM+1 to Admin checks made over a long timeframe.',
      },
    ],
    description:
      'Amphibious humanoid bureaucrats whose entire civilisation runs on filed paperwork and ritual procedure. Calm, methodical, much smarter than their plodding diplomacy suggests.',
    source: 'Mongoose Traveller 2022 Core Rulebook; Aliens of Charted Space Vol. 1',
  },
  luriani: {
    id: 'luriani',
    name: 'Luriani',
    charModifiers: { DEX: +1, EDU: +1, SOC: -1 },
    traits: [
      {
        name: 'Aquatic Adaptation',
        description:
          'Webbed fingers and toes, partial gill structures. DM+2 to Athletics (endurance) checks made while swimming. Comfortable in pressurised aquatic environments.',
      },
    ],
    description:
      'Aquatic-adapted human variant from the worlds of the Luriani Cultural Region. Slight build, graceful in water, scholarly inclination.',
    source: 'Aliens of Charted Space Vol. 2, Mongoose Publishing',
  },
  jonkeereen: {
    id: 'jonkeereen',
    name: 'Jonkeereen',
    charModifiers: { DEX: -1, END: +1, SOC: +1 },
    traits: [
      {
        name: 'Sociable',
        description:
          'Jonkeereen culture rewards visible affiliation and showmanship. DM+1 to social interactions where status display matters.',
      },
      {
        name: 'Robust Constitution',
        description:
          'Built for endurance over agility. Reduced reflexes compared to human baseline, but greater stamina.',
      },
    ],
    description:
      'Humanoid species known for their elaborate honour-society etiquette and visible status markers. Travellers find them gregarious, formal, and not above grudges.',
    source: 'Aliens of Charted Space Vol. 2, Mongoose Publishing',
  },
};
