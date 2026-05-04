// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { dieValue, newCharacter, rollAllCharacteristics, scriptedRng } from './index';

describe('Psionics gating at creation', () => {
  it('rollAllCharacteristics does NOT roll PSI when psionics is off', () => {
    const c = newCharacter('id', 'NoPsi', 'human');
    expect(c.wizardState?.psionicsEnabled).toBeUndefined();

    // 12 die values for the 6 char rolls (2D each).
    const dice = Array(12).fill(dieValue(4));
    const updated = rollAllCharacteristics(c, scriptedRng(dice));
    expect(updated.psi).toBeUndefined();
  });

  it('rollAllCharacteristics rolls PSI when psionics is on', () => {
    let c = newCharacter('id', 'WithPsi', 'human');
    c = { ...c, wizardState: { ...(c.wizardState ?? { step: 'basics' }), psionicsEnabled: true } };

    // 14 die values for 7 char rolls (2D each).
    const dice = [
      ...Array(12).fill(dieValue(4)), // 6 chars all → 8 each
      dieValue(5),
      dieValue(4), // PSI roll → 9
    ];
    const updated = rollAllCharacteristics(c, scriptedRng(dice));
    expect(updated.psi).toEqual({ max: 9, current: 9 });
    // Roll log should include a PSI entry.
    const psiLog = updated.rollLog.find((r) => r.context.includes('PSI'));
    expect(psiLog).toBeDefined();
    expect(psiLog!.result).toBe(9);
  });

  it('PSI floor at 0 when 2D − terms goes negative (later in life)', () => {
    let c = newCharacter('id', 'OldPsi', 'human');
    c = { ...c, wizardState: { ...(c.wizardState ?? { step: 'basics' }), psionicsEnabled: true } };
    // Pretend they've already served terms — push 8 stub terms onto careerHistory.
    c = {
      ...c,
      careerHistory: Array.from({ length: 8 }).map((_, i) => ({
        index: i,
        career: 'agent' as const,
        assignment: 'law_enforcement',
        qualified: true,
        skillRolls: [],
        survival: { rolled: 7, target: 6, success: true },
        rankAtEnd: 0,
        isOfficer: false,
        termOutcome: 'continued' as const,
      })),
    };

    // 2D = 4 (1+3); 4 − 8 = −4 → floor 0.
    const dice = [
      ...Array(12).fill(dieValue(4)), // 6 standard chars
      dieValue(1),
      dieValue(3),
    ];
    const updated = rollAllCharacteristics(c, scriptedRng(dice));
    expect(updated.psi).toEqual({ max: 0, current: 0 });
  });
});
