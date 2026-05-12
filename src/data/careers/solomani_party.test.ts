// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { CAREERS, CAREER_LIST } from './index';
import { solomani_party } from './solomani_party';

describe('Solomani Party career', () => {
  it('is registered in CAREERS under id "solomani_party"', () => {
    expect(CAREERS.solomani_party).toBeDefined();
    expect(CAREERS.solomani_party).toBe(solomani_party);
  });

  it('declares availability only in the Solomani Confederation', () => {
    expect(solomani_party.availableInSocieties).toEqual(['solomani_confederation']);
  });

  it('has three assignments with the canonical labels', () => {
    const ids = solomani_party.assignments.map((a) => a.id).sort();
    expect(ids).toEqual(['agitator', 'functionary', 'officer']);
  });

  it('has the standard chargen tables (qualification, skills, mishaps, events, mustering)', () => {
    expect(solomani_party.qualification.check).toEqual({ kind: 'char', char: 'SOC', target: 6 });
    expect(solomani_party.skillTables.length).toBeGreaterThanOrEqual(3);
    expect(solomani_party.mishaps.length).toBe(6);
    expect(solomani_party.events.length).toBe(11); // rolls 2-12 inclusive
    expect(solomani_party.musteringOut.cash.length).toBe(7);
    expect(solomani_party.musteringOut.benefits.length).toBe(7);
  });

  it('filtering by society — Imperial Traveller does NOT see Solomani Party in their pool', () => {
    const imperialSociety = 'third_imperium' as const;
    const visible = CAREER_LIST.filter((c) => {
      if (!c.availableInSocieties || c.availableInSocieties.length === 0) return true;
      return c.availableInSocieties.includes(imperialSociety);
    });
    expect(visible.map((c) => c.id)).not.toContain('solomani_party');
  });

  it('filtering by society — Confederation Traveller DOES see Solomani Party', () => {
    const society = 'solomani_confederation' as const;
    const visible = CAREER_LIST.filter((c) => {
      if (!c.availableInSocieties || c.availableInSocieties.length === 0) return true;
      return c.availableInSocieties.includes(society);
    });
    expect(visible.map((c) => c.id)).toContain('solomani_party');
    // Core careers still visible too — Solomani Confederation citizens can
    // still join the Confederation Army's analogue of Imperial Army etc.
    // (We don't have Confederation Army yet, but standard Army etc. should
    // still be available since they have no availability restriction.)
    expect(visible.map((c) => c.id)).toContain('army');
    expect(visible.map((c) => c.id)).toContain('agent');
  });
});
