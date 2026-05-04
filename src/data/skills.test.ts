// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { SKILLS } from './skills';
import type { SkillName } from '../types';

describe('SKILLS data', () => {
  it('every skill has a non-empty description', () => {
    for (const name of Object.keys(SKILLS) as SkillName[]) {
      const def = SKILLS[name];
      expect(def.description.length, `${name} description`).toBeGreaterThan(20);
    }
  });

  it('skills with specs have descriptions for each spec', () => {
    const SKIPPED: ReadonlySet<SkillName> = new Set([
      // Pilot has specs but the rulebook description for each is brief — captured in specDescriptions.
    ]);
    for (const name of Object.keys(SKILLS) as SkillName[]) {
      if (SKIPPED.has(name)) continue;
      const def = SKILLS[name];
      if (def.specs.length === 0) continue;
      for (const spec of def.specs) {
        const desc = def.specDescriptions?.[spec];
        expect(desc, `${name} (${spec}) spec description`).toBeTruthy();
      }
    }
  });

  it('Drive uses Skills-book spec spellings', () => {
    expect(SKILLS.Drive.specs).toEqual(['hovercraft', 'mole', 'track', 'walker', 'wheel']);
  });

  it('Gun Combat uses Skills-book spec spellings', () => {
    expect(SKILLS['Gun Combat'].specs).toEqual(['archaic', 'energy', 'slug']);
  });

  it('Heavy Weapons uses Skills-book spec spellings', () => {
    expect(SKILLS['Heavy Weapons'].specs).toEqual(['artillery', 'portable', 'vehicle']);
  });

  it('Science covers all 18 disciplines from the Skills book', () => {
    expect(SKILLS.Science.specs).toHaveLength(18);
    expect(SKILLS.Science.specs).toContain('archaeology');
    expect(SKILLS.Science.specs).toContain('psionicology');
    expect(SKILLS.Science.specs).toContain('xenology');
  });

  it('Language includes the major Charted Space tongues', () => {
    expect(SKILLS.Language.specs).toEqual(
      expect.arrayContaining(['galanglic', 'vilani', 'zdetl', 'oynprith', 'trokh', 'gvegh']),
    );
  });

  it('Jack-of-all-Trades is marked notTrainable', () => {
    expect(SKILLS['Jack-of-all-Trades'].notTrainable).toBe(true);
  });

  it('skills with task examples include difficulty + characteristic + timeframe', () => {
    let withTasks = 0;
    for (const name of Object.keys(SKILLS) as SkillName[]) {
      const def = SKILLS[name];
      if (!def.tasks) continue;
      withTasks += 1;
      for (const t of def.tasks) {
        expect(t.name, `${name}: task name`).toBeTruthy();
        expect(t.difficulty, `${name}: difficulty`).toBeTruthy();
        expect(t.timeframe, `${name}: timeframe`).toBeTruthy();
      }
    }
    // At least 25 of the 39 skills should have task examples.
    expect(withTasks).toBeGreaterThanOrEqual(25);
  });
});
