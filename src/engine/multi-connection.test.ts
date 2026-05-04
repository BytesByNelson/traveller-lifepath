import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  resolveNameConnection,
  type EngineState,
} from './index';

describe('gain_connection — multi-grant progress indicator', () => {
  it('exposes current/total progress through each name_connection prompt', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      // count: { fixed: 3 } simulates a resolved D3 = 3.
      { type: 'gain_connection', connection: 'ally', count: { fixed: 3 } },
    ]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('name_connection');
    if (state.prompt?.kind !== 'name_connection') throw new Error('expected name_connection');
    expect(state.prompt.progress).toEqual({ current: 1, total: 3 });

    state = resolveNameConnection(state, 'Alice');
    if (state.prompt?.kind !== 'name_connection') throw new Error('expected second prompt');
    expect(state.prompt.progress).toEqual({ current: 2, total: 3 });

    state = resolveNameConnection(state, 'Bob');
    if (state.prompt?.kind !== 'name_connection') throw new Error('expected third prompt');
    expect(state.prompt.progress).toEqual({ current: 3, total: 3 });

    state = resolveNameConnection(state, 'Carol');
    expect(state.prompt).toBeUndefined();
    expect(state.character.connections.allies).toHaveLength(3);
  });

  it('omits progress field when only one connection is granted', () => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_connection', connection: 'rival' }]);
    state = drain(state);
    if (state.prompt?.kind !== 'name_connection') throw new Error('expected name_connection');
    expect(state.prompt.progress).toBeUndefined();
  });
});
