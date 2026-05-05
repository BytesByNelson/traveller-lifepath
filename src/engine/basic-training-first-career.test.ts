import { describe, it, expect } from 'vitest';
import { applyBasicTraining, newCharacter } from './index';
import type { CareerTerm } from '../types';

const stubTerm = (overrides: Partial<CareerTerm>): CareerTerm => ({
  index: 0,
  career: 'navy',
  assignment: 'flight',
  qualified: true,
  skillRolls: [],
  survival: { rolled: 8, target: 6, success: true },
  rankAtEnd: 0,
  isOfficer: false,
  termOutcome: 'continued',
  ...overrides,
});

describe('applyBasicTraining — first-career gate', () => {
  it('grants all six service skills on the very first career, first term', () => {
    const c = newCharacter('id', 'X', 'human');
    expect(c.careerHistory).toHaveLength(0);
    const after = applyBasicTraining(c, 'army', 'infantry', 0);
    // Army's service skills include Drive(via choice), Athletics, Gun Combat, Recon, Melee, Heavy Weapons.
    // The exact set depends on data — assert at least 5 service-table skills landed at level 0.
    const newSkills = after.backgroundSkills.filter((s) => s.source.kind === 'basic_training');
    expect(newSkills.length).toBeGreaterThanOrEqual(5);
    expect(newSkills.every((s) => s.level === 0)).toBe(true);
  });

  it('grants nothing without a picked skill on a subsequent career', () => {
    // Player has 4 Navy terms behind them. termIndex (= careerHistory.length) = 4.
    let c = newCharacter('id', 'X', 'human');
    c = { ...c, careerHistory: [0, 1, 2, 3].map((i) => stubTerm({ index: i })) };
    const before = c.backgroundSkills.length;
    const after = applyBasicTraining(c, 'agent', 'intelligence', c.careerHistory.length);
    expect(after.backgroundSkills.length).toBe(before);
  });

  it('grants exactly one service skill on a subsequent career when one is picked', () => {
    let c = newCharacter('id', 'X', 'human');
    c = { ...c, careerHistory: [0, 1, 2, 3].map((i) => stubTerm({ index: i })) };
    const after = applyBasicTraining(c, 'agent', 'intelligence', c.careerHistory.length, { name: 'Streetwise' });
    const newSkills = after.backgroundSkills.filter((s) => s.source.kind === 'basic_training');
    expect(newSkills).toHaveLength(1);
    expect(newSkills[0]?.name).toBe('Streetwise');
    expect(newSkills[0]?.level).toBe(0);
  });

  it('preserves the spec when picking a specialised service skill (e.g. Melee (unarmed) on Drifter)', () => {
    // Drifter's service-skills table has roll-2: gain_skill Melee (unarmed). On a
    // subsequent-career first-term basic training, picking that row must land on
    // the sheet as Melee (unarmed), not generic Melee.
    let c = newCharacter('id', 'X', 'human');
    c = { ...c, careerHistory: [0, 1].map((i) => stubTerm({ index: i, career: 'army', assignment: 'infantry' })) };
    const after = applyBasicTraining(c, 'drifter', 'wanderer', c.careerHistory.length, { name: 'Melee', spec: 'unarmed' });
    const melee = after.backgroundSkills.find((s) => s.source.kind === 'basic_training' && s.name === 'Melee');
    expect(melee?.spec).toBe('unarmed');
    expect(melee?.level).toBe(0);
  });
});
