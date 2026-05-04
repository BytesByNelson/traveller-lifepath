import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  resolveConvertConnection,
  resolvePickConnectionType,
  type EngineState,
} from './index';
import type { Connection } from '../types';

const seed = (overrides: Partial<{ contacts: Connection[]; allies: Connection[]; rivals: Connection[]; enemies: Connection[] }> = {}) => {
  const c = newCharacter('id', 'X', 'human');
  return {
    ...c,
    connections: {
      contacts: [],
      allies: [],
      rivals: [],
      enemies: [],
      ...overrides,
    },
  };
};

describe('convert_connection', () => {
  it('prompts when matching connections exist', () => {
    const c = seed({
      contacts: [{ id: 'a1', type: 'contact', description: 'Eddie' }],
    });
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'convert_connection', from: ['contact', 'ally'], to: ['rival', 'enemy'], orGainNew: true },
    ]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('convert_connection');
    if (state.prompt?.kind !== 'convert_connection') throw new Error('expected prompt');
    expect(state.prompt.convertibles.map((x) => x.id)).toEqual(['a1']);
    expect(state.prompt.targetTypes).toEqual(['rival', 'enemy']);
  });

  it('moves the chosen connection to the new bucket', () => {
    const c = seed({
      contacts: [{ id: 'a1', type: 'contact', description: 'Eddie' }],
    });
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'convert_connection', from: ['contact', 'ally'], to: ['rival', 'enemy'], orGainNew: true },
    ]);
    state = drain(state);
    state = resolveConvertConnection(state, 'a1', 'rival');
    expect(state.character.connections.contacts).toHaveLength(0);
    expect(state.character.connections.rivals).toHaveLength(1);
    expect(state.character.connections.rivals[0]).toMatchObject({ id: 'a1', type: 'rival', description: 'Eddie' });
  });

  it('falls through to gain a new connection when nothing matches', () => {
    const c = seed({
      // No contacts or allies — only an enemy that doesn't match the from-list.
      enemies: [{ id: 'e1', type: 'enemy', description: 'old foe' }],
    });
    let state: EngineState = blankEngineState(c);
    state = enqueue(state, [
      { type: 'convert_connection', from: ['contact', 'ally'], to: ['rival', 'enemy'], orGainNew: true },
    ]);
    state = drain(state);
    expect(state.prompt?.kind).toBe('pick_connection_type');
    if (state.prompt?.kind !== 'pick_connection_type') throw new Error('expected pick_connection_type');
    expect(state.prompt.choices).toEqual(['rival', 'enemy']);
    state = resolvePickConnectionType(state, 'rival');
    // Engine then pauses on a name_connection prompt for the new rival.
    expect(state.prompt?.kind).toBe('name_connection');
  });
});
