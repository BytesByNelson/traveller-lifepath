import { describe, it, expect } from 'vitest';
import { applySpeciesModifiers, getAge } from './selectors';
import { newCharacter } from './wizard';

describe('selectors', () => {
  it('applySpeciesModifiers adds Aslan STR+2 / DEX-2', () => {
    const out = applySpeciesModifiers({ STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 }, 'aslan');
    expect(out).toEqual({ STR: 9, DEX: 5, END: 7, INT: 7, EDU: 7, SOC: 7 });
  });

  it('applySpeciesModifiers adds Vargr STR-1 DEX+1 END-1', () => {
    const out = applySpeciesModifiers({ STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 }, 'vargr');
    expect(out).toEqual({ STR: 6, DEX: 8, END: 6, INT: 7, EDU: 7, SOC: 7 });
  });

  it('applySpeciesModifiers floors at 1, never below', () => {
    const out = applySpeciesModifiers({ STR: 7, DEX: 2, END: 7, INT: 7, EDU: 7, SOC: 7 }, 'aslan');
    expect(out.DEX).toBe(1);
  });

  it('age advances by 4 per career term, starting at 18', () => {
    const c = newCharacter('id', 'Test', 'human');
    expect(getAge(c)).toBe(18);
    const c2 = { ...c, careerHistory: [...c.careerHistory, makeStubTerm(0), makeStubTerm(1)] };
    expect(getAge(c2)).toBe(26);
  });
});

const makeStubTerm = (index: number) =>
  ({
    index,
    career: 'agent' as const,
    assignment: 'law_enforcement',
    qualified: true,
    skillRolls: [],
    survival: { rolled: 7, target: 6, success: true },
    rankAtEnd: 0,
    isOfficer: false,
    termOutcome: 'continued' as const,
  });
