// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { blankEngineState, drain, enqueue, newCharacter, scriptedRng } from './index';
import type { Character, SkillEntry } from '../types';

const fillSkills = (count: number, level: number): SkillEntry[] => {
  const names = [
    'Admin', 'Advocate', 'Animals', 'Astrogation', 'Athletics', 'Broker',
    'Carouse', 'Deception', 'Diplomat', 'Drive', 'Electronics', 'Engineer',
    'Explosives', 'Flyer', 'Gambler', 'Investigate', 'Leadership', 'Mechanic',
    'Medic', 'Melee', 'Navigation', 'Persuade', 'Recon', 'Stealth', 'Steward',
    'Streetwise', 'Survival', 'Vacc Suit',
  ] as SkillEntry['name'][];
  return names.slice(0, count).map((name) => ({ name, level, source: { kind: 'manual' as const } }));
};

const seed = (intStat: number, eduStat: number, skills: SkillEntry[]): Character => ({
  ...newCharacter('id', 'Cap', 'human'),
  characteristics: { STR: 7, DEX: 7, END: 7, INT: intStat, EDU: eduStat, SOC: 7 },
  backgroundSkills: skills,
});

describe('Total skill cap (3 × INT + EDU)', () => {
  it('grants under cap normally', () => {
    // INT 10 + EDU 10 → cap 60. Existing total 5; gain Stealth 1 → 6, well under.
    let state = blankEngineState(seed(10, 10, fillSkills(5, 1)));
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Stealth' }, level: 1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.prompt).toBeUndefined();
    expect(state.character.backgroundSkills.find((s) => s.name === 'Stealth')?.level).toBe(1);
  });

  it('rejects when granting would exceed the cap', () => {
    // INT 4 + EDU 4 → cap 24. Seed with 24 levels' worth of skills.
    // 24 skills at level 1 → 24 total. Granting another would push to 25 > 24.
    // Use Jack-of-all-Trades (no specs) and not in the seed list so we're actually adding.
    let state = blankEngineState(seed(4, 4, fillSkills(24, 1)));
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' }, level: 1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.prompt?.kind).toBe('note');
    if (state.prompt?.kind !== 'note') throw new Error('expected note');
    expect(state.prompt.text).toMatch(/Skill cap reached/);
    expect(state.character.backgroundSkills.find((s) => s.name === 'Jack-of-all-Trades')).toBeUndefined();
  });

  it('allows granting up to the cap exactly', () => {
    // INT 4 + EDU 4 → cap 24. Seed at 23. Granting +1 hits 24 exactly.
    const skills = fillSkills(23, 1);
    let state = blankEngineState(seed(4, 4, skills));
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Jack-of-all-Trades' }, level: 1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.prompt).toBeUndefined();
    expect(state.character.backgroundSkills.find((s) => s.name === 'Jack-of-all-Trades')?.level).toBe(1);
  });

  it('does not block raising an already-existing skill while under the cap', () => {
    // The cap counts total levels, so going from Admin 1 → Admin 2 adds +1.
    // Cap 6 (INT 1, EDU 1) — Admin 1, Stealth 1, Recon 1 = 3 total. Raise Admin to 2 → 4. OK.
    const skills: SkillEntry[] = [
      { name: 'Admin', level: 1, source: { kind: 'manual' } },
      { name: 'Stealth', level: 1, source: { kind: 'manual' } },
      { name: 'Recon', level: 1, source: { kind: 'manual' } },
    ];
    let state = blankEngineState(seed(1, 1, skills));
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Admin' } }]);
    state = drain(state, scriptedRng([]));
    expect(state.character.backgroundSkills.find((s) => s.name === 'Admin')?.level).toBe(2);
  });

  it('blocks raising when already at the cap', () => {
    // Cap 6 (INT 1, EDU 1). Admin 1 + Stealth 1 + Recon 1 + Survival 1 + Pilot 1 + Medic 1 = 6.
    // Try to raise Admin to 2 → would push total to 7 > 6.
    const skills: SkillEntry[] = [
      { name: 'Admin', level: 1, source: { kind: 'manual' } },
      { name: 'Stealth', level: 1, source: { kind: 'manual' } },
      { name: 'Recon', level: 1, source: { kind: 'manual' } },
      { name: 'Survival', level: 1, source: { kind: 'manual' } },
      { name: 'Pilot', level: 1, source: { kind: 'manual' } },
      { name: 'Medic', level: 1, source: { kind: 'manual' } },
    ];
    let state = blankEngineState(seed(1, 1, skills));
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Admin' } }]);
    state = drain(state, scriptedRng([]));
    expect(state.prompt?.kind).toBe('note');
    expect(state.character.backgroundSkills.find((s) => s.name === 'Admin')?.level).toBe(1);
  });
});
