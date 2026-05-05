import { describe, it, expect } from 'vitest';
import {
  drain,
  isAutoCommissioned,
  newCharacter,
  resolveCheck,
  startCommission,
} from './index';
import { CAREERS } from '../data';
import type { Character } from '../types';

const setChar = (c: Character, values: Partial<Character['characteristics']>): Character => ({
  ...c,
  characteristics: { ...c.characteristics, ...values },
});

describe('startCommission — pre-career grad bonus', () => {
  it('adds the +DM to the commission check on first term in any military career (university grad)', () => {
    let c = newCharacter('id', 'Cadet', 'human');
    c = setChar(c, { SOC: 8 });
    c = {
      ...c,
      wizardState: {
        step: 'career_term',
        preCareerBonus: {
          qualifyDM: { dm: 1, careers: [] },
          commission: { dm: 2, auto: false },
        },
      },
    };
    let state = startCommission(c, CAREERS.army, 0, () => 0.5);
    expect(state.prompt?.kind).toBe('check');
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    // The Carried DM should appear in the prompt's dms breakdown.
    const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
    expect(carried?.value).toBe(2);

    // Resolve a roll of natural 6 + carried 2 = total 8 (target 8 — pass).
    state = resolveCheck(state, 6, 8, undefined, 'manual');
    state = drain(state);
    const last = state.character.rollLog.filter((r) => r.target !== undefined).at(-1);
    expect(last?.success).toBe(true);
  });

  it('does NOT apply the bonus on a second-term commission attempt', () => {
    let c = newCharacter('id', 'Cadet', 'human');
    c = setChar(c, { SOC: 8 });
    c = {
      ...c,
      wizardState: {
        step: 'career_term',
        preCareerBonus: {
          qualifyDM: { dm: 1, careers: [] },
          commission: { dm: 2, auto: false },
        },
      },
    };
    // termsInThisCareer = 1 — second term in this career.
    const state = startCommission(c, CAREERS.army, 1, () => 0.5);
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
    // Per-term-after-first DM is -1 (army's commission has perTermAfterFirst: -1).
    expect(carried?.value).toBe(-1);
  });

  it('Military Academy grad bonus only applies to the tied career', () => {
    let c = newCharacter('id', 'Cadet', 'human');
    c = setChar(c, { SOC: 8 });
    c = {
      ...c,
      wizardState: {
        step: 'career_term',
        preCareerBonus: {
          qualifyDM: { dm: 0, careers: [] },
          commission: { dm: 2, auto: false, tiedTo: 'navy' },
        },
      },
    };
    // First term in Army — bonus is tied to Navy, shouldn't apply.
    const state = startCommission(c, CAREERS.army, 0, () => 0.5);
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
    expect(carried).toBeUndefined();
  });

  it.each(['army', 'marine', 'navy'] as const)(
    'University grad bonus applies on first term of %s',
    (careerId) => {
      let c = newCharacter('id', 'Cadet', 'human');
      c = setChar(c, { SOC: 8 });
      c = {
        ...c,
        wizardState: {
          step: 'career_term',
          preCareerBonus: {
            qualifyDM: { dm: 0, careers: [] },
            commission: { dm: 2, auto: false }, // university grad: no tiedTo
          },
        },
      };
      const state = startCommission(c, CAREERS[careerId], 0, () => 0.5);
      if (state.prompt?.kind !== 'check') throw new Error('expected check');
      const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
      expect(carried?.value).toBe(2);
    },
  );

  it.each([
    ['army', 'army', true],
    ['army', 'marine', false],
    ['army', 'navy', false],
    ['marine', 'army', false],
    ['marine', 'marine', true],
    ['marine', 'navy', false],
    ['navy', 'army', false],
    ['navy', 'marine', false],
    ['navy', 'navy', true],
  ] as const)(
    'Military Academy %s grad: bonus on %s career → %s',
    (academy, joining, expectApply) => {
      let c = newCharacter('id', 'Cadet', 'human');
      c = setChar(c, { SOC: 8 });
      c = {
        ...c,
        wizardState: {
          step: 'career_term',
          preCareerBonus: {
            qualifyDM: { dm: 0, careers: [] },
            commission: { dm: 2, auto: false, tiedTo: academy },
          },
        },
      };
      const state = startCommission(c, CAREERS[joining], 0, () => 0.5);
      if (state.prompt?.kind !== 'check') throw new Error('expected check');
      const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
      if (expectApply) expect(carried?.value).toBe(2);
      else expect(carried).toBeUndefined();
    },
  );
});

describe('isAutoCommissioned', () => {
  it('returns true on first term with auto bonus and no tiedTo', () => {
    const c: Character = {
      ...newCharacter('id', 'X', 'human'),
      wizardState: {
        step: 'career_term',
        preCareerBonus: {
          qualifyDM: { dm: 0, careers: [] },
          commission: { dm: 2, auto: true },
        },
      },
    };
    expect(isAutoCommissioned(c, 'army', 0)).toBe(true);
    expect(isAutoCommissioned(c, 'navy', 0)).toBe(true);
  });

  it('returns false on second term', () => {
    const c: Character = {
      ...newCharacter('id', 'X', 'human'),
      wizardState: {
        step: 'career_term',
        preCareerBonus: {
          qualifyDM: { dm: 0, careers: [] },
          commission: { dm: 2, auto: true },
        },
      },
    };
    expect(isAutoCommissioned(c, 'army', 1)).toBe(false);
  });

  it('respects tiedTo', () => {
    const c: Character = {
      ...newCharacter('id', 'X', 'human'),
      wizardState: {
        step: 'career_term',
        preCareerBonus: {
          qualifyDM: { dm: 0, careers: [] },
          commission: { dm: 2, auto: true, tiedTo: 'navy' },
        },
      },
    };
    expect(isAutoCommissioned(c, 'navy', 0)).toBe(true);
    expect(isAutoCommissioned(c, 'army', 0)).toBe(false);
  });
});
