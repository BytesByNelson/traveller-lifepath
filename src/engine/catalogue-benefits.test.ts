// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  enqueue,
  drain,
  newCharacter,
  resolvePickCatalogueItem,
  skipPickCatalogueItem,
  scriptedRng,
} from './index';

describe('Catalogue-aware mustering-out benefits', () => {
  it('gain_benefit { armour, Cr10000, TL12 } pauses on a pick_catalogue_item prompt', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    expect(state.prompt?.kind).toBe('pick_catalogue_item');
    if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('expected catalogue prompt');
    expect(state.prompt.category).toBe('armour');
    expect(state.prompt.tlMax).toBe(12);
    expect(state.prompt.costMax).toBe(10000);
  });

  it('gain_benefit { weapon, Cr3000, TL12 } only includes melee/slug/energy categories', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('expected catalogue prompt');
    expect(state.prompt.weaponCategories).toEqual(['melee_weapon', 'slug_weapon', 'energy_weapon']);
  });

  it('gain_benefit { gun } excludes melee weapons', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'gun', crLimit: 3000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('expected catalogue prompt');
    expect(state.prompt.weaponCategories).toEqual(['slug_weapon', 'energy_weapon']);
    expect(state.prompt.weaponCategories).not.toContain('melee_weapon');
  });

  it('gain_benefit { blade } restricts to Melee blade specialty', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'blade', crLimit: 1000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('expected catalogue prompt');
    expect(state.prompt.weaponCategories).toEqual(['melee_weapon']);
    expect(state.prompt.weaponSpec).toBe('blade');
  });

  it('gain_benefit { cybernetic_implant } maps to augment category', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'cybernetic_implant', crLimit: 75000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('expected catalogue prompt');
    expect(state.prompt.category).toBe('augment');
    expect(state.prompt.tlMax).toBe(12);
  });

  it('gain_benefit { scientific_equipment } maps to gear category', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'scientific_equipment', crLimit: 2000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    if (state.prompt?.kind !== 'pick_catalogue_item') throw new Error('expected catalogue prompt');
    expect(state.prompt.category).toBe('gear');
  });

  it('gain_benefit { tas_membership } stays a note (no catalogue match)', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'tas_membership' } },
    ]);
    state = drain(state, scriptedRng([]));
    expect(state.prompt?.kind).toBe('note');
  });

  it('gain_benefit { free_trader } stays a note', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'free_trader' } },
    ]);
    state = drain(state, scriptedRng([]));
    expect(state.prompt?.kind).toBe('note');
  });

  it('resolvePickCatalogueItem appends armour to character.armor', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    state = resolvePickCatalogueItem(state, 'cloth_tl10');
    expect(state.prompt).toBeUndefined();
    expect(state.character.armor).toHaveLength(1);
    expect(state.character.armor[0]!.name).toBe('Cloth (TL10)');
    expect(state.character.armor[0]!.protection).toBe(8);
  });

  it('resolvePickCatalogueItem appends weapon to character.weapons', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'weapon', crLimit: 3000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    state = resolvePickCatalogueItem(state, 'autopistol');
    expect(state.character.weapons).toHaveLength(1);
    expect(state.character.weapons[0]!.name).toBe('Autopistol');
    expect(state.character.weapons[0]!.damage).toBe('3D-3');
  });

  it('resolvePickCatalogueItem appends augment to character.augments', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'cybernetic_implant', crLimit: 75000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    state = resolvePickCatalogueItem(state, 'subdermal_armour_tl11');
    expect(state.character.augments).toHaveLength(1);
    expect(state.character.augments[0]!.name).toContain('Subdermal Armour');
  });

  it('resolvePickCatalogueItem appends gear to character.equipment', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'scientific_equipment', crLimit: 2000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    state = resolvePickCatalogueItem(state, 'em_probe');
    expect(state.character.equipment).toHaveLength(1);
    expect(state.character.equipment[0]!.name).toBe('EM Probe');
  });

  it('skipPickCatalogueItem turns the prompt into a note instead of crashing', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    state = skipPickCatalogueItem(state);
    expect(state.prompt?.kind).toBe('note');
  });

  it('throws if you try to resolve with an unknown id', () => {
    let state = blankEngineState(newCharacter('id', 'Test', 'human'));
    state = enqueue(state, [
      { type: 'gain_benefit', benefit: { type: 'armour', crLimit: 10000, tlLimit: 12 } },
    ]);
    state = drain(state, scriptedRng([]));
    expect(() => resolvePickCatalogueItem(state, 'nonexistent_id')).toThrow(/Unknown catalogue id/);
  });

  it('throws if you try to resolve when not on a pick_catalogue_item prompt', () => {
    const state = blankEngineState(newCharacter('id', 'Test', 'human'));
    expect(() => resolvePickCatalogueItem(state, 'autopistol')).toThrow(/Not waiting/);
  });
});
