import type { ArmourDef, AugmentDef, CatalogueEntry, GearDef, WeaponDef } from '../../types';
import { ARMOUR } from './armour';
import { AUGMENTS } from './augments';
import { GEAR } from './gear';
import { ENERGY_WEAPONS, GRENADES, HEAVY_WEAPONS, MELEE_WEAPONS, SLUG_WEAPONS, WEAPONS } from './weapons';

export { ARMOUR, AUGMENTS, GEAR, WEAPONS, MELEE_WEAPONS, SLUG_WEAPONS, ENERGY_WEAPONS, GRENADES, HEAVY_WEAPONS };
export { EQUIPMENT_TRAITS } from './traits';

/** Single source of truth for all catalogue items, keyed by id. */
export const CATALOGUE: Map<string, CatalogueEntry> = new Map();

for (const a of ARMOUR) CATALOGUE.set(a.id, { kind: 'armour', item: a });
for (const w of WEAPONS) CATALOGUE.set(w.id, { kind: 'weapon', item: w });
for (const a of AUGMENTS) CATALOGUE.set(a.id, { kind: 'augment', item: a });
for (const g of GEAR) CATALOGUE.set(g.id, { kind: 'gear', item: g });

export const findCatalogueItem = (id: string): CatalogueEntry | undefined => CATALOGUE.get(id);

export type CatalogueFilter = {
  /** Maximum TL the picker should show (inclusive). */
  tlMax?: number;
  /** Maximum cost in Cr. */
  costMax?: number;
};

export const filterArmour = (filter: CatalogueFilter = {}): ArmourDef[] =>
  ARMOUR.filter((a) => withinFilter(a.tl, a.cost, filter));

export const filterWeapons = (filter: CatalogueFilter = {}): WeaponDef[] =>
  WEAPONS.filter((w) => withinFilter(w.tl, w.cost, filter));

export const filterAugments = (filter: CatalogueFilter = {}): AugmentDef[] =>
  AUGMENTS.filter((a) => withinFilter(a.tl, a.cost, filter));

export const filterGear = (filter: CatalogueFilter = {}): GearDef[] =>
  GEAR.filter((g) => withinFilter(g.tl, g.cost, filter));

const withinFilter = (tl: number, cost: number, filter: CatalogueFilter): boolean => {
  if (filter.tlMax !== undefined && tl > filter.tlMax) return false;
  if (filter.costMax !== undefined && cost > filter.costMax) return false;
  return true;
};
