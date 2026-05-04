// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  dieValue,
  drain,
  enqueue,
  newCharacter,
  resolvePickChar,
  scriptedRng,
} from './index';
import { INJURY_TABLE } from '../data';

describe('Injury 1D auto-reduction', () => {
  it('Injury row 2 rolls 1D and prompts for which physical char to reduce', () => {
    const row = INJURY_TABLE.find((r) => r.roll === 2)!;
    let state = blankEngineState(newCharacter('id', 'Wounded', 'human'));

    // 1D = 4 → reduce chosen char by 4.
    const rng = scriptedRng([dieValue(4)]);
    state = enqueue(state, row.effects);
    state = drain(state, rng);

    expect(state.prompt?.kind).toBe('pick_char');
    if (state.prompt?.kind !== 'pick_char') throw new Error('expected pick_char');
    expect(state.prompt.chars.sort()).toEqual(['DEX', 'END', 'STR']);
    expect(state.prompt.delta).toBe(-4);
    expect(state.prompt.title).toMatch(/−4|−4|-4|1D → 4/);
  });

  it('Injury row 1 rolls 1D, then prompts for two further -2 reductions', () => {
    const row = INJURY_TABLE.find((r) => r.roll === 1)!;
    let state = blankEngineState({
      ...newCharacter('id', 'Critically Wounded', 'human'),
      characteristics: { STR: 10, DEX: 10, END: 10, INT: 9, EDU: 9, SOC: 7 },
    });

    // 1D → 5.
    const rng = scriptedRng([dieValue(5)]);
    state = enqueue(state, row.effects);
    state = drain(state, rng);

    // First prompt is the rolled -5 reduction.
    expect(state.prompt?.kind).toBe('pick_char');
    if (state.prompt?.kind !== 'pick_char') throw new Error('first prompt missing');
    expect(state.prompt.delta).toBe(-5);

    // Resolve to STR.
    state = resolvePickChar(state, 'STR');
    expect(state.character.characteristics.STR).toBe(5);

    // Second prompt: -2 to a physical char.
    expect(state.prompt?.kind).toBe('pick_char');
    if (state.prompt?.kind !== 'pick_char') throw new Error('second prompt missing');
    expect(state.prompt.delta).toBe(-2);
    state = resolvePickChar(state, 'DEX');
    expect(state.character.characteristics.DEX).toBe(8);

    // Third prompt: another -2.
    expect(state.prompt?.kind).toBe('pick_char');
    state = resolvePickChar(state, 'END');
    expect(state.character.characteristics.END).toBe(8);

    // No more prompts.
    expect(state.prompt).toBeUndefined();
  });

  it('the rolled value is recorded in the roll log', () => {
    const row = INJURY_TABLE.find((r) => r.roll === 2)!;
    let state = blankEngineState(newCharacter('id', 'Wounded', 'human'));
    state = enqueue(state, row.effects);
    state = drain(state, scriptedRng([dieValue(3)]));
    const lastLog = state.character.rollLog.at(-1);
    expect(lastLog).toBeDefined();
    expect(lastLog!.result).toBe(3);
    expect(lastLog!.context).toMatch(/1D/);
  });
});
