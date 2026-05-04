import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  resolveNameConnection,
  type EngineState,
} from './index';

describe('gain_connection — bucket mapping', () => {
  it.each([
    ['contact', 'contacts'],
    ['ally', 'allies'],
    ['rival', 'rivals'],
    ['enemy', 'enemies'],
  ] as const)('adds a %s to the %s bucket without throwing', (type, bucket) => {
    const c = newCharacter('id', 'X', 'human');
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [{ type: 'gain_connection', connection: type }]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('name_connection');
    state = resolveNameConnection(state, 'Test connection');
    expect(state.character.connections[bucket]).toHaveLength(1);
    expect(state.character.connections[bucket][0]).toMatchObject({ type, description: 'Test connection' });
  });
});
