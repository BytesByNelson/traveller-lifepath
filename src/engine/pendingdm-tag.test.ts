import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  resolveCheck,
  type EngineState,
} from './index';

describe('pendingDM consumption — tag-based', () => {
  it('a tagged "qualification" check consumes nextQualification', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'next_qualification_dm', dm: 2 },
      {
        type: 'check',
        roll: { kind: 'char', char: 'SOC', target: 8 },
        onSuccess: [],
        onFailure: [],
        category: 'qualification',
      },
    ]);
    state = drain(state);
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
    expect(carried?.value).toBe(2);
    state = resolveCheck(state, 7, 9, undefined, 'manual');
    expect(state.pendingDMs.nextQualification).toBeUndefined();
  });

  it('an UNTAGGED check (e.g. event-internal sub-roll) does NOT consume pendingDMs', () => {
    // This is the brittle-regex bug we're fixing: an event titled "Special qualification
    // training" would have matched /qualification/i and stolen the banked DM. With tags,
    // only checks the engine explicitly marks consume — untagged sub-rolls don't.
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'next_qualification_dm', dm: 2 },
      // Untagged sub-check (no category) — must not consume.
      {
        type: 'check',
        roll: { kind: 'char', char: 'SOC', target: 8 },
        onSuccess: [],
        onFailure: [],
      },
    ]);
    state = drain(state);
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
    expect(carried).toBeUndefined();
    state = resolveCheck(state, 8, 8, undefined, 'manual');
    // The +2 DM is still banked for the eventual qualification check.
    expect(state.pendingDMs.nextQualification).toBe(2);
  });

  it('survival-tagged check consumes nextSurvival, not nextAdvancement', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'next_survival_dm', dm: 2 },
      { type: 'next_advancement_dm', dm: -3 },
      {
        type: 'check',
        roll: { kind: 'char', char: 'END', target: 6 },
        onSuccess: [],
        onFailure: [],
        category: 'survival',
      },
    ]);
    state = drain(state);
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
    expect(carried?.value).toBe(2);
    state = resolveCheck(state, 5, 7, undefined, 'manual');
    // Only nextSurvival was cleared; nextAdvancement is still banked for the next adv check.
    expect(state.pendingDMs.nextSurvival).toBeUndefined();
    expect(state.pendingDMs.nextAdvancement).toBe(-3);
  });

  it('commission category shares the nextQualification bucket (rulebook idiom)', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'next_qualification_dm', dm: 2 }, // pre-career commission bonus uses this bucket
      {
        type: 'check',
        roll: { kind: 'char', char: 'SOC', target: 8 },
        onSuccess: [],
        onFailure: [],
        category: 'commission',
      },
    ]);
    state = drain(state);
    if (state.prompt?.kind !== 'check') throw new Error('expected check');
    const carried = state.prompt.dms.find((d) => d.source === 'Carried DM');
    expect(carried?.value).toBe(2);
    state = resolveCheck(state, 6, 8, undefined, 'manual');
    expect(state.pendingDMs.nextQualification).toBeUndefined();
  });
});
