// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  blankEngineState,
  drain,
  enqueue,
  newCharacter,
  scriptedRng,
  setPSI,
} from './index';
import type { Character } from '../types';

const seed = (psi: number, current?: number): Character => {
  const c = newCharacter('id', 'Psi', 'human');
  return setPSI(c, psi, current ?? psi);
};

describe('modify_psi effect', () => {
  it('+1 raises both max and current when current was at max', () => {
    let state = blankEngineState(seed(8));
    state = enqueue(state, [{ type: 'modify_psi', delta: 1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.character.psi).toEqual({ max: 9, current: 9 });
  });

  it('+1 raises max but leaves current unchanged when current was below max', () => {
    let state = blankEngineState(seed(8, 3));
    state = enqueue(state, [{ type: 'modify_psi', delta: 1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.character.psi).toEqual({ max: 9, current: 3 });
  });

  it('-1 reduces max and clamps current to the new max', () => {
    let state = blankEngineState(seed(8));
    state = enqueue(state, [{ type: 'modify_psi', delta: -1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.character.psi).toEqual({ max: 7, current: 7 });
  });

  it('-1 leaves current alone if current is already below the new max', () => {
    let state = blankEngineState(seed(8, 3));
    state = enqueue(state, [{ type: 'modify_psi', delta: -1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.character.psi).toEqual({ max: 7, current: 3 });
  });

  it('floor at 0', () => {
    let state = blankEngineState(seed(1));
    state = enqueue(state, [{ type: 'modify_psi', delta: -5 }]);
    state = drain(state, scriptedRng([]));
    expect(state.character.psi).toEqual({ max: 0, current: 0 });
  });

  it('no-op for characters with no PSI', () => {
    let state = blankEngineState(newCharacter('id', 'Mundane', 'human'));
    state = enqueue(state, [{ type: 'modify_psi', delta: 1 }]);
    state = drain(state, scriptedRng([]));
    expect(state.character.psi).toBeUndefined();
  });
});

describe('Psion career data uses modify_psi (no more notes)', () => {
  it('Personal Development row 6 increases PSI by 1', async () => {
    const { psion } = await import('../data/careers/psion');
    const pd = psion.skillTables.find((t) => t.id === 'personal_development')!;
    const row6 = pd.rows.find((r) => r.roll === 6)!;
    expect(row6.effect).toEqual({ type: 'modify_psi', delta: 1 });
  });

  it('Mishap row 2 reduces PSI by 1', async () => {
    const { psion } = await import('../data/careers/psion');
    const row2 = psion.mishaps.find((m) => m.roll === 2)!;
    const psiEffect = row2.effects.find((e) => e.type === 'modify_psi');
    expect(psiEffect).toEqual({ type: 'modify_psi', delta: -1 });
  });

  it('Event row 8 increases PSI by 1', async () => {
    const { psion } = await import('../data/careers/psion');
    const row8 = psion.events.find((e) => e.roll === 8)!;
    expect(row8.effects).toContainEqual({ type: 'modify_psi', delta: 1 });
  });
});
