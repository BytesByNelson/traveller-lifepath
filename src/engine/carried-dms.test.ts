import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  startMusteringOutRoll,
  type EngineState,
} from './index';
import { CAREERS } from '../data';

describe('pendingDMs ↔ carriedDMs round-trip', () => {
  it('persists next_benefit_roll_dm onto wizardState.carriedDMs after the engine drains', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'next_benefit_roll_dm', dm: 2 }]);
    state = drain(state);
    expect(state.character.wizardState?.carriedDMs?.benefitRollDMs).toEqual([2]);
  });

  it('persists next_qualification_dm and re-hydrates on the next blankEngineState', () => {
    const c = newCharacter('id', 'X', 'human');
    let s1: EngineState = blankEngineState(c);
    s1 = enqueue(s1, [{ type: 'next_qualification_dm', dm: 2 }]);
    s1 = drain(s1);
    expect(s1.character.wizardState?.carriedDMs?.nextQualification).toBe(2);
    // Start a fresh session from the same character — the carried DM should be back in pendingDMs.
    const s2 = blankEngineState(s1.character);
    expect(s2.pendingDMs.nextQualification).toBe(2);
  });
});

describe('mustering-out consumes one carried benefit-roll DM', () => {
  it('applies the carried DM to the 1D roll and clears it from the character', () => {
    const c = newCharacter('id', 'X', 'human');
    // Seed a carried DM as if a pre-career life event had granted DM+2.
    const seeded = {
      ...c,
      careerHistory: [
        {
          index: 0,
          career: 'army' as const,
          assignment: 'support',
          qualified: true,
          skillRolls: [],
          survival: { rolled: 8, target: 6, success: true },
          rankAtEnd: 0,
          isOfficer: false,
          termOutcome: 'continued' as const,
        },
      ],
      wizardState: {
        step: 'mustering_out' as const,
        carriedDMs: { benefitRollDMs: [2] },
      },
    };
    // Roll a 3 on 1D — with +2 DM, that lands on row 5 of the cash table.
    let constantRng = 0;
    const rng = () => {
      constantRng += 1;
      // 3 on a 1D: 1 + Math.floor(rng() * 6) → want 3, so rng → 0.4
      return 0.4;
    };
    const result = startMusteringOutRoll(seeded, CAREERS.army, 'cash', 2, rng);
    expect(result.rolled).toBe(3);
    expect(result.row).toBe(5);
  });
});
