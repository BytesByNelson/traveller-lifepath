// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  attemptLearnTalent,
  dieValue,
  grantTalent,
  knowsTalent,
  learnedTalents,
  newCharacter,
  psiDM,
  rollPSI,
  scriptedRng,
  setPSI,
} from './index';
import type { Character } from '../types';

const give = (c: Character, psi: number): Character => ({ ...c, psi: { max: psi, current: psi } });

describe('PSI rolling', () => {
  it('rollPSI = 2D − terms, floored at 0', () => {
    // 2D = 9, terms = 0 → PSI 9
    const r = rollPSI(scriptedRng([dieValue(4), dieValue(5)]), 0);
    expect(r.rolled).toBe(9);
    expect(r.psi).toBe(9);
  });

  it('rollPSI floor 0 for high-term Travellers with low rolls', () => {
    // 2D = 4, terms = 8 → PSI 0 (would be -4)
    const r = rollPSI(scriptedRng([dieValue(2), dieValue(2)]), 8);
    expect(r.rolled).toBe(4);
    expect(r.psi).toBe(0);
  });

  it('psiDM mirrors characteristic DM bands', () => {
    expect(psiDM(0)).toBe(-3);
    expect(psiDM(2)).toBe(-2);
    expect(psiDM(8)).toBe(0);
    expect(psiDM(11)).toBe(1);
    expect(psiDM(14)).toBe(2);
    expect(psiDM(15)).toBe(3);
  });
});

describe('Talent learning', () => {
  it('grants telepathy at level 0 on success', () => {
    let c = newCharacter('id', 'Luka', 'human');
    c = give(c, 9); // PSI DM +1
    // Telepathy DM +4. PriorAttempts 0. Roll 2D = 6. Total 6 + 1 + 4 = 11 ≥ 8 → success.
    const rng = scriptedRng([dieValue(3), dieValue(3)]);
    const result = attemptLearnTalent(c, 'telepathy', 0, rng);
    expect(result.success).toBe(true);
    expect(result.psiDM).toBe(1);
    expect(result.talentDM).toBe(4);
    expect(result.priorPenalty).toBe(0);
    expect(result.total).toBe(11);
  });

  it('cumulative −1 penalty per prior attempt', () => {
    let c = newCharacter('id', 'Luka', 'human');
    c = give(c, 9);
    // 2 prior attempts → priorPenalty -2
    const rng = scriptedRng([dieValue(3), dieValue(3)]);
    const result = attemptLearnTalent(c, 'telepathy', 2, rng);
    expect(result.priorPenalty).toBe(-2);
    expect(result.total).toBe(6 + 1 + 4 - 2);
    expect(result.success).toBe(true); // 9 ≥ 8
  });

  it('low PSI plus high-DM talent fails', () => {
    let c = newCharacter('id', 'Luka', 'human');
    c = give(c, 3); // PSI DM -1
    // Teleportation DM 0. Roll 2D = 5. Total 5 + (-1) + 0 = 4 < 8 → fail.
    const rng = scriptedRng([dieValue(2), dieValue(3)]);
    const result = attemptLearnTalent(c, 'teleportation', 0, rng);
    expect(result.success).toBe(false);
  });

  it('throws if character has no PSI', () => {
    const c = newCharacter('id', 'NoPotential', 'human');
    expect(() => attemptLearnTalent(c, 'telepathy', 0, scriptedRng([]))).toThrow(/PSI/);
  });
});

describe('grantTalent / knowsTalent / learnedTalents', () => {
  it('grants the matching skill at level 0', () => {
    let c = newCharacter('id', 'Luka', 'human');
    c = give(c, 9);
    expect(knowsTalent(c, 'telepathy')).toBe(false);
    c = grantTalent(c, 'telepathy');
    expect(knowsTalent(c, 'telepathy')).toBe(true);
    expect(c.backgroundSkills.find((s) => s.name === 'Telepathy' && !s.spec)?.level).toBe(0);
  });

  it('idempotent — granting twice does not duplicate', () => {
    let c = newCharacter('id', 'Luka', 'human');
    c = give(c, 9);
    c = grantTalent(c, 'telepathy');
    c = grantTalent(c, 'telepathy');
    const matches = c.backgroundSkills.filter((s) => s.name === 'Telepathy' && !s.spec);
    expect(matches).toHaveLength(1);
  });

  it('learnedTalents lists every talent the character has', () => {
    let c = newCharacter('id', 'Luka', 'human');
    c = give(c, 9);
    c = grantTalent(c, 'telepathy');
    c = grantTalent(c, 'clairvoyance');
    expect(learnedTalents(c).sort()).toEqual(['clairvoyance', 'telepathy']);
  });
});

describe('setPSI', () => {
  it('sets max + current and clamps current to max', () => {
    const c0 = newCharacter('id', 'Luka', 'human');
    const c1 = setPSI(c0, 8);
    expect(c1.psi).toEqual({ max: 8, current: 8 });
    const c2 = setPSI(c0, 5, 99);
    expect(c2.psi).toEqual({ max: 5, current: 5 });
  });
});
