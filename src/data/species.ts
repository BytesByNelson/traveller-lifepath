import type { Species, SpeciesId } from '../types';

export const SPECIES: Record<SpeciesId, Species> = {
  human: {
    id: 'human',
    name: 'Human',
    charModifiers: {},
    traits: [],
    description: 'Baseline human Traveller.',
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
  },
};
