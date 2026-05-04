// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  POWERS_BY_TALENT,
  PSIONIC_POWERS,
  findPsionicPower,
} from './psionics';
import { PSIONIC_RANGE_LABELS, TALENT_LEARNING_DMS, TALENT_NAMES } from '../types';
import type { PsionicTalentId } from '../types';

describe('PSIONIC_POWERS data', () => {
  it('every power has a unique id', () => {
    const ids = new Set<string>();
    for (const p of PSIONIC_POWERS) {
      expect(ids.has(p.id), `duplicate ${p.id}`).toBe(false);
      ids.add(p.id);
    }
  });

  it('every power references a known talent', () => {
    const valid: PsionicTalentId[] = ['telepathy', 'clairvoyance', 'telekinesis', 'awareness', 'teleportation'];
    for (const p of PSIONIC_POWERS) {
      expect(valid).toContain(p.talent);
    }
  });

  it('every power has a difficulty + range + description + timeframe', () => {
    for (const p of PSIONIC_POWERS) {
      expect(p.difficulty).toBeTruthy();
      expect(p.range).toBeTruthy();
      expect(p.description.length).toBeGreaterThan(20);
      expect(p.timeframe).toBeTruthy();
    }
  });

  it('canonical Telepathy powers are present', () => {
    expect(findPsionicPower('tp_life_detection')?.psiCost).toBe(1);
    expect(findPsionicPower('tp_assault')?.difficulty).toBe('formidable');
    expect(findPsionicPower('tp_assault')?.psiCost).toBe(8);
    expect(findPsionicPower('tp_probe')?.range).toBe('close');
  });

  it('Awareness powers are personal-range only', () => {
    for (const p of POWERS_BY_TALENT.awareness) {
      expect(p.range, `${p.id} range`).toBe('personal');
    }
  });

  it('every range band has a human label', () => {
    const usedRanges = new Set(PSIONIC_POWERS.map((p) => p.range));
    for (const range of usedRanges) {
      expect(PSIONIC_RANGE_LABELS[range]).toBeTruthy();
    }
  });

  it('TALENT_LEARNING_DMS covers all five talents and Telepathy has the highest base DM', () => {
    expect(TALENT_LEARNING_DMS).toHaveLength(5);
    const sorted = [...TALENT_LEARNING_DMS].sort((a, b) => b.baseDM - a.baseDM);
    expect(sorted[0]!.talent).toBe('telepathy');
    expect(sorted[0]!.baseDM).toBe(4);
    expect(sorted[sorted.length - 1]!.talent).toBe('teleportation');
    expect(sorted[sorted.length - 1]!.baseDM).toBe(0);
  });

  it('TALENT_NAMES covers all five talents in title case', () => {
    expect(TALENT_NAMES.telepathy).toBe('Telepathy');
    expect(TALENT_NAMES.clairvoyance).toBe('Clairvoyance');
    expect(TALENT_NAMES.telekinesis).toBe('Telekinesis');
    expect(TALENT_NAMES.awareness).toBe('Awareness');
    expect(TALENT_NAMES.teleportation).toBe('Teleportation');
  });
});
