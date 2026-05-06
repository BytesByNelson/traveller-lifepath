// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  pushContext,
  resolveCheck,
  scriptedRng,
  dieValue,
  newCharacter,
} from './index';
import type { Effect } from '../types';

const seed = () => newCharacter('id', 'Logger', 'human');

describe('Roll log context labelling', () => {
  it('top-level check (e.g. survival) does NOT duplicate the pushed context', () => {
    const c = { ...seed(), characteristics: { STR: 9, DEX: 7, END: 9, INT: 9, EDU: 9, SOC: 9 } };
    let state = blankEngineState(c);
    state = pushContext(state, 'Army (Support) — Survival');
    const check: Effect = {
      type: 'check',
      roll: { kind: 'char', char: 'STR', target: 6 },
      onSuccess: [],
      onFailure: [],
      category: 'survival',
    };
    state = enqueue(state, [check]);
    state = drain(state, scriptedRng([dieValue(4), dieValue(5)]));
    // resolveCheck reads the pending prompt and writes the log entry.
    state = resolveCheck(state, 9, 9);
    const lastLog = state.character.rollLog.at(-1)!;
    // No "Army (Support) — Survival / Army (Support) — Survival" duplication.
    expect(lastLog.context).toBe('Army (Support) — Survival');
  });

  it('event sub-check uses its description, producing a clear two-segment path', () => {
    const c = { ...seed(), characteristics: { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 } };
    let state = blankEngineState(c);
    state = pushContext(state, 'Pre-career event → 10');
    const check: Effect = {
      type: 'check',
      roll: { kind: 'char', char: 'EDU', target: 9 },
      description: 'EDU 9+ to win the academic spat',
      onSuccess: [],
      onFailure: [],
    };
    state = enqueue(state, [check]);
    state = drain(state, scriptedRng([dieValue(3), dieValue(3)]));
    state = resolveCheck(state, 6, 6);
    const lastLog = state.character.rollLog.at(-1)!;
    expect(lastLog.context).toBe('Pre-career event → 10 / EDU 9+ to win the academic spat');
  });

  it('check without description and without context falls back to a roll-derived title', () => {
    const c = { ...seed(), characteristics: { STR: 7, DEX: 7, END: 7, INT: 7, EDU: 7, SOC: 7 } };
    let state = blankEngineState(c);
    const check: Effect = {
      type: 'check',
      roll: { kind: 'char', char: 'EDU', target: 6 },
      onSuccess: [],
      onFailure: [],
    };
    state = enqueue(state, [check]);
    state = drain(state, scriptedRng([dieValue(3), dieValue(3)]));
    state = resolveCheck(state, 6, 6);
    const lastLog = state.character.rollLog.at(-1)!;
    // Should be the synthesized title, not an empty string.
    expect(lastLog.context.length).toBeGreaterThan(0);
  });

});
