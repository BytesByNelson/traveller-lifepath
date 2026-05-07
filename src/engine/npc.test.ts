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

  it('defaults to "Unnamed Traveller" when no name given', () => {
    const c = generateNpc({ terms: 1 }, scriptedRng(Array(500).fill(dieValue(4))));
    expect(c.name).toBe('Unnamed Traveller');
  });
});
