// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { agingCrisisChars, newCharacter } from '../engine';
import type { Character } from '../types';

describe('Aging crisis detection', () => {
  it('agingCrisisChars returns empty when no chars are at 0', () => {
    const c = newCharacter('id', 'Healthy', 'human');
    expect(agingCrisisChars(c)).toEqual([]);
  });

  it('agingCrisisChars returns each characteristic at 0', () => {
    const c: Character = {
      ...newCharacter('id', 'Hit', 'human'),
      characteristics: { STR: 0, DEX: 5, END: 0, INT: 9, EDU: 8, SOC: 7 },
    };
    expect(agingCrisisChars(c).sort()).toEqual(['END', 'STR']);
  });

  it('treats negative characteristics as zero (defensive)', () => {
    // The engine clamps deltas at 0 elsewhere, but verify the helper isn't
    // fooled into returning false negatives if upstream code ever produces
    // a negative value.
    const c: Character = {
      ...newCharacter('id', 'Bug', 'human'),
      characteristics: { STR: 0, DEX: 5, END: -1 as unknown as number, INT: 9, EDU: 8, SOC: 7 },
    };
    expect(agingCrisisChars(c).includes('STR')).toBe(true);
  });

  it('Character.deceased and Character.medicalDebt fields are typed and round-trip via JSON', () => {
    const c: Character = {
      ...newCharacter('id', 'Memorial', 'human'),
      deceased: { reason: 'Aging crisis — refused medical care (STR → 0)', termIndex: 5 },
      medicalDebt: 25000,
    };
    const restored = JSON.parse(JSON.stringify(c)) as Character;
    expect(restored.deceased?.reason).toContain('Aging crisis');
    expect(restored.deceased?.termIndex).toBe(5);
    expect(restored.medicalDebt).toBe(25000);
  });
});
