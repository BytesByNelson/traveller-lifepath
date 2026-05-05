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

describe('force_fail_pre_career_graduation', () => {
  it('sets wizardState.forceFailPreCareerGraduation', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'force_fail_pre_career_graduation' }]);
    state = drain(state);
    expect(state.character.wizardState?.forceFailPreCareerGraduation).toBe(true);
  });
});

describe('prisoner_on_natural_two', () => {
  it('forces prisoner career next term when 2D rolls a 2', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    // Both dice 1 → 2D = 2.
    const rng = scriptedRng([dieValue(1), dieValue(1)]);
    state = enqueue(state, [{ type: 'prisoner_on_natural_two' }]);
    state = drain(state, rng);
    expect(state.flags.forcedNextCareer).toBe('prisoner');
    expect(state.character.rollLog.at(-1)?.context).toContain('Prisoner-on-2');
  });

  it('does nothing for 2D > 2 but still records the roll', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    // 4 + 5 = 9.
    const rng = scriptedRng([dieValue(4), dieValue(5)]);
    state = enqueue(state, [{ type: 'prisoner_on_natural_two' }]);
    state = drain(state, rng);
    expect(state.flags.forcedNextCareer).toBeUndefined();
    expect(state.character.rollLog.at(-1)?.natural).toBe(9);
  });
});
