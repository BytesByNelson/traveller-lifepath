import type { EquipmentTrait, EquipmentTraitId } from '../../types';

export const EQUIPMENT_TRAITS: Record<EquipmentTraitId, EquipmentTrait> = {
  AP: {
    id: 'AP',
    shortName: 'AP',
    description: 'Armour Piercing N reduces target armour by N.',
    hasRating: true,
  },
  Auto: {
    id: 'Auto',
    shortName: 'Auto',
    description:
      'A weapon with Auto N can fire on full auto (N attacks at once with separate aim) or burst fire (N rounds expended for +N damage).',
    hasRating: true,
  },
  Artillery: {
    id: 'Artillery',
    shortName: 'Artillery',
    description: 'Targets need not be visible. Indirect fire requires a spotter and a comms link.',
  },
  Blast: {
    id: 'Blast',
    shortName: 'Blast',
    description: 'Damages every target in a blast radius equal to the rating in metres.',
    hasRating: true,
  },
  Bulky: {
    id: 'Bulky',
    shortName: 'Bulky',
    description: 'Wielding without STR 9+ inflicts DM-1 to attack rolls.',
  },
  'Very Bulky': {
    id: 'Very Bulky',
    shortName: 'Very Bulky',
    description: 'Wielding without STR 12+ inflicts DM-2 to attack rolls.',
  },
  Dangerous: {
    id: 'Dangerous',
    shortName: 'Dangerous',
    description: 'A roll of natural 2 inflicts the weapon\'s damage on the wielder.',
  },
  'Lo-Pen': {
    id: 'Lo-Pen',
    shortName: 'Lo-Pen',
    description: 'Armour gets multiplied protection — pellet weapons typically have Lo-Pen 2.',
    hasRating: true,
  },
  Radiation: {
    id: 'Radiation',
    shortName: 'Radiation',
    description: 'Anyone within 6m of the firer (without rad protection) takes 1D × Tech Level rads on each shot.',
  },
  Scope: {
    id: 'Scope',
    shortName: 'Scope',
    description: 'A scoped weapon ignores the long-range DM penalty when carefully aimed.',
  },
  Smart: {
    id: 'Smart',
    shortName: 'Smart',
    description: 'Smart weapons get a built-in Aim action without spending a Minor Action.',
  },
  Stun: {
    id: 'Stun',
    shortName: 'Stun',
    description: 'Damage applies to END instead of physical characteristics; victims fall unconscious at END 0.',
  },
  'Zero-G': {
    id: 'Zero-G',
    shortName: 'Zero-G',
    description: 'No DM penalty when fired in zero-gravity environments.',
  },
};
