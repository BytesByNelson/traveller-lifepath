// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { generateNpc } from './npc';
import { dieValue, scriptedRng } from './index';

describe('generateNpc — autopilot', () => {
  it('returns a complete Character with valid schema', () => {
    // Plenty of dice — autopilot pulls many rolls. scriptedRng will throw if
    // it runs dry, which is fine: it surfaces real bugs in the auto-resolver.
    const dice = Array(2000).fill(dieValue(4)); // every "roll" yields ~8 → mostly successes
    const c = generateNpc({ name: 'Test NPC', terms: 2 }, scriptedRng(dice));
    expect(c.name).toBe('Test NPC');
    expect(c.species).toBe('human');
    expect(c.schemaVersion).toBe(1);
    expect(c.id).toBeTruthy();
    expect(c.characteristics.STR).toBeGreaterThan(0);
    // 2 terms requested → up to 2 careers committed (could be fewer if
    // ejection short-circuits).
    expect(c.careerHistory.length).toBeGreaterThan(0);
    expect(c.careerHistory.length).toBeLessThanOrEqual(2);
    expect(c.wizardState?.step).toBe('done');
  });

  it('respects target term count', () => {
    const dice = Array(5000).fill(dieValue(4));
    const c = generateNpc({ name: 'Veteran', terms: 4 }, scriptedRng(dice));
    expect(c.careerHistory.length).toBeLessThanOrEqual(4);
  });

  it('different rngs produce different characters (smoke check)', () => {
    const a = generateNpc({ name: 'A', terms: 2 }, scriptedRng(Array(2000).fill(dieValue(3))));
    const b = generateNpc({ name: 'B', terms: 2 }, scriptedRng(Array(2000).fill(dieValue(5))));
    expect(a.characteristics).not.toEqual(b.characteristics);
  });

  it('generates a species-appropriate name when none given', () => {
    const c = generateNpc({ terms: 1 }, scriptedRng(Array(2000).fill(dieValue(4))));
    expect(c.name).not.toBe('');
    expect(c.name).not.toBe('Unnamed Traveller');
    // Two-token "First Last" structure.
    expect(c.name.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  it('respects an explicit name', () => {
    const c = generateNpc({ name: 'Captain Nelson', terms: 1 }, scriptedRng(Array(500).fill(dieValue(4))));
    expect(c.name).toBe('Captain Nelson');
  });

  it('seeds the first career with Psion when psionics is enabled', () => {
    const c = generateNpc(
      { name: 'Psi NPC', terms: 1, psionics: true },
      scriptedRng(Array(2000).fill(dieValue(4))),
    );
    // First attempted career was Psion. (Whether the NPC qualified is roll-
    // dependent — failed qualification falls back to Drifter per RAW.)
    const firstTerm = c.careerHistory[0];
    expect(firstTerm).toBeDefined();
    // PSI characteristic was rolled.
    expect(c.psi).toBeDefined();
    // Either ended up in psion (qualified) or drifter (failed); never a
    // random other career when psionics was the explicit pick.
    expect(['psion', 'drifter']).toContain(firstTerm!.career);
  });
});
