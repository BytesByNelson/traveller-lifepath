// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  ARMOUR,
  AUGMENTS,
  CATALOGUE,
  ENERGY_WEAPONS,
  EQUIPMENT_TRAITS,
  GEAR,
  GRENADES,
  HEAVY_WEAPONS,
  MELEE_WEAPONS,
  SLUG_WEAPONS,
  WEAPONS,
  filterArmour,
  filterAugments,
  filterGear,
  filterWeapons,
  findCatalogueItem,
} from './index';

describe('Equipment catalogue', () => {
  it('every catalogue id is unique', () => {
    const ids = new Set<string>();
    for (const k of CATALOGUE.keys()) {
      expect(ids.has(k), `duplicate id: ${k}`).toBe(false);
      ids.add(k);
    }
  });

  it('every armour has a positive cost (or 0 for improvised) and a TL', () => {
    for (const a of ARMOUR) {
      expect(a.tl, `${a.id} TL`).toBeGreaterThanOrEqual(1);
      expect(a.cost, `${a.id} cost`).toBeGreaterThanOrEqual(0);
      expect(a.protection, `${a.id} protection`).toBeGreaterThan(0);
    }
  });

  it('battle dress requires Vacc Suit and is heavy', () => {
    const bd = ARMOUR.find((a) => a.id === 'battle_dress_tl13');
    expect(bd).toBeDefined();
    expect(bd!.requiredSkill?.name).toBe('Vacc Suit');
    expect(bd!.protection).toBe(22);
    expect(bd!.notes).toMatch(/Powered/i);
  });

  it('weapons span all five categories', () => {
    expect(MELEE_WEAPONS.length).toBeGreaterThan(0);
    expect(SLUG_WEAPONS.length).toBeGreaterThan(0);
    expect(ENERGY_WEAPONS.length).toBeGreaterThan(0);
    expect(GRENADES.length).toBeGreaterThan(0);
    expect(HEAVY_WEAPONS.length).toBeGreaterThan(0);
    expect(WEAPONS.length).toBe(
      MELEE_WEAPONS.length + SLUG_WEAPONS.length + ENERGY_WEAPONS.length + GRENADES.length + HEAVY_WEAPONS.length,
    );
  });

  it('every weapon has the appropriate trainer skill', () => {
    for (const w of MELEE_WEAPONS) expect(w.skill).toBe('Melee');
    for (const w of SLUG_WEAPONS) expect(w.skill).toBe('Gun Combat');
    for (const w of ENERGY_WEAPONS) expect(w.skill).toBe('Gun Combat');
    for (const w of GRENADES) expect(w.skill).toBe('Athletics');
    for (const w of HEAVY_WEAPONS) expect(w.skill).toBe('Heavy Weapons');
  });

  it('weapons referencing a trait reference one that exists', () => {
    for (const w of WEAPONS) {
      for (const t of w.traits) {
        expect(EQUIPMENT_TRAITS[t.trait], `${w.id} trait ${t.trait}`).toBeDefined();
        if (t.rating !== undefined) {
          expect(EQUIPMENT_TRAITS[t.trait].hasRating, `${t.trait} should accept a rating`).toBe(true);
        }
      }
    }
  });

  it('augments include the canonical "+1/+2/+3" stat bumps', () => {
    expect(AUGMENTS.find((a) => a.id === 'cognitive_aug_tl12')?.improvement).toBe('INT +1');
    expect(AUGMENTS.find((a) => a.id === 'strength_aug_tl15')?.improvement).toBe('STR +3');
  });

  it('GEAR covers medical, sensors, comms, computers, survival, drugs', () => {
    const cats = new Set(GEAR.map((g) => g.category));
    expect(cats.has('medical')).toBe(true);
    expect(cats.has('sensor')).toBe(true);
    expect(cats.has('communications')).toBe(true);
    expect(cats.has('computer')).toBe(true);
    expect(cats.has('survival')).toBe(true);
    expect(cats.has('drug')).toBe(true);
  });

  it('findCatalogueItem returns kinded entries', () => {
    const e = findCatalogueItem('cutlass');
    expect(e?.kind).toBe('weapon');
    if (e?.kind === 'weapon') expect(e.item.damage).toBe('3D');

    const a = findCatalogueItem('cloth_tl10');
    expect(a?.kind).toBe('armour');
    if (a?.kind === 'armour') expect(a.item.protection).toBe(8);
  });

  it('TL filter trims down catalogue results', () => {
    const lowTL = filterWeapons({ tlMax: 5 });
    expect(lowTL.every((w) => w.tl <= 5)).toBe(true);
    expect(lowTL.length).toBeLessThan(WEAPONS.length);
  });

  it('cost filter trims down catalogue results', () => {
    const cheapArmour = filterArmour({ costMax: 200 });
    expect(cheapArmour.every((a) => a.cost <= 200)).toBe(true);

    const cheapAugments = filterAugments({ costMax: 5000 });
    expect(cheapAugments.every((a) => a.cost <= 5000)).toBe(true);

    const cheapGear = filterGear({ costMax: 1000 });
    expect(cheapGear.every((g) => g.cost <= 1000)).toBe(true);
  });

  it('Plasma Rifle is TL16 / 6D damage', () => {
    const pr = ENERGY_WEAPONS.find((w) => w.id === 'plasma_rifle');
    expect(pr).toBeDefined();
    expect(pr!.tl).toBe(16);
    expect(pr!.damage).toBe('6D');
  });

  it('FGHP family carries Radiation', () => {
    for (const id of ['fghp_14', 'fghp_15', 'fghp_16']) {
      const w = HEAVY_WEAPONS.find((x) => x.id === id);
      expect(w).toBeDefined();
      expect(w!.traits.some((t) => t.trait === 'Radiation')).toBe(true);
    }
  });
});
