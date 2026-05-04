import { describe, it, expect } from 'vitest';
import {
  applyBasicTraining,
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  type EngineState,
} from './index';

describe('gain_skill — bump semantics from level 0', () => {
  it('bumps an existing level-0 skill to level 1 when level is undefined (rulebook +1 semantic)', () => {
    let c = newCharacter('id', 'X', 'human');
    c = {
      ...c,
      backgroundSkills: [
        { name: 'Vacc Suit', level: 0, source: { kind: 'background' } },
      ],
    };
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Vacc Suit' } }]);
    state = drain(state);
    const vacc = state.character.backgroundSkills.find((s) => s.name === 'Vacc Suit');
    expect(vacc?.level).toBe(1);
  });

  it('Marine basic training + Star Marine row-1 grant brings Vacc Suit from 0 to 1', () => {
    // Reproduce the user-reported flow: enter Marine, run basic training (adds Vacc Suit at 0
    // among other service skills), then resolve a gain_skill for Vacc Suit (which Star Marine
    // row 1 emits). The end-state Vacc Suit level should be 1, not 0.
    let c = newCharacter('id', 'X', 'human');
    c = applyBasicTraining(c, 'marine', 'star_marine', 0);
    expect(c.backgroundSkills.find((s) => s.name === 'Vacc Suit')?.level).toBe(0);

    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_skill', skill: { name: 'Vacc Suit' } }]);
    state = drain(state);

    const vacc = state.character.backgroundSkills.find((s) => s.name === 'Vacc Suit');
    expect(vacc?.level).toBe(1);
  });
});
