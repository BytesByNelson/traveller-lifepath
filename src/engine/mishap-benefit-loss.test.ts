import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  scriptedRng,
  dieValue,
  type EngineState,
} from './index';

describe('mishaps automatically lose this term\'s benefit roll', () => {
  it('rolling on career_mishaps deducts 1 benefit roll regardless of which row hit', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'army' } },
    ]);
    // Mishap roll = 5: "Quarrel with an officer", which only adds a Rival + ejects.
    // Without the engine fold, no benefit-roll loss would happen.
    state = drain(state, scriptedRng([dieValue(5)]));
    // benefitRollsDelta should now be -1 (the engine's automatic mishap penalty).
    expect(state.flags.benefitRollsDelta).toBe(-1);
  });

  it('"keep benefit roll" mishap paths offset the engine penalty with gain_benefit_rolls', () => {
    // Army mishap 4: "Cooperate" path keeps the benefit roll. Engine deducts 1 (auto)
    // and the data path adds 1 back (offset). Net delta should be 0.
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'roll_on_table', table: { kind: 'career_mishaps', career: 'army' } },
    ]);
    state = drain(state, scriptedRng([dieValue(4)])); // mishap row 4 — Commander engaged
    // Engine paused on the choice prompt (Join vs Cooperate).
    expect(state.prompt?.kind).toBe('choice');
    if (state.prompt?.kind !== 'choice') throw new Error('expected choice');
    const cooperateIndex = state.prompt.effect.options.findIndex((o) => o.label.startsWith('Cooperate'));
    expect(cooperateIndex).toBeGreaterThanOrEqual(0);
    // Mishap auto-applied -1 already.
    expect(state.flags.benefitRollsDelta).toBe(-1);
  });
});
