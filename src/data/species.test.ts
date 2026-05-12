// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SPECIES } from './species';
import type { SpeciesId } from '../types';

describe('Species roster', () => {
  it('includes every SpeciesId the type allows', () => {
    const ids: SpeciesId[] = [
      'human', 'aslan', 'vargr',
      'solomani', 'vilani', 'sword_worlder',
      'bwap', 'luriani', 'jonkeereen',
    ];
    for (const id of ids) {
      expect(SPECIES[id], `${id} should be in SPECIES`).toBeDefined();
      expect(SPECIES[id].id).toBe(id);
    }
  });

  it('every species has a source attribution', () => {
    for (const [id, species] of Object.entries(SPECIES)) {
      expect(species.source, `${id} missing source`).toBeTruthy();
      // Source string should mention the publisher or sourcebook by name.
      expect(species.source).toMatch(/Mongoose|Charted Space|Spinward/i);
    }
  });

  it('human variants share the baseline stat profile', () => {
    // Solomani / Vilani / Sword Worlder are cultural distinctions per RAW —
    // no biological stat modifiers vs baseline human.
    for (const id of ['solomani', 'vilani', 'sword_worlder'] as const) {
      expect(SPECIES[id].charModifiers).toEqual({});
    }
  });

  it('alien races have distinct stat modifiers', () => {
    expect(SPECIES.bwap.charModifiers).toMatchObject({ STR: -1, END: -1, EDU: 2 });
    expect(SPECIES.luriani.charModifiers).toMatchObject({ DEX: 1, EDU: 1, SOC: -1 });
    expect(SPECIES.jonkeereen.charModifiers).toMatchObject({ DEX: -1, END: 1, SOC: 1 });
  });

  it('every species has a non-empty description', () => {
    for (const [id, species] of Object.entries(SPECIES)) {
      expect(species.description.length, `${id} description empty`).toBeGreaterThan(20);
    }
  });
});
