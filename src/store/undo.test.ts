// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { canUndo, popSnapshot, pushSnapshot, resetUndoForTesting, stackDepth } from './undo';
import { newCharacter } from '../engine';
import type { Character } from '../types';

const named = (id: string, name: string): Character => ({ ...newCharacter(id, name, 'human') });

describe('undo', () => {
  beforeEach(() => resetUndoForTesting());

  it('canUndo is false on empty stack', () => {
    expect(canUndo('a')).toBe(false);
  });

  it('push then pop restores the same state', () => {
    const c = named('a', 'Alpha');
    pushSnapshot('a', c);
    expect(canUndo('a')).toBe(true);
    expect(stackDepth('a')).toBe(1);
    expect(popSnapshot('a')).toEqual(c);
    expect(canUndo('a')).toBe(false);
  });

  it('LIFO ordering — most recent comes back first', () => {
    pushSnapshot('a', named('a', '1'));
    pushSnapshot('a', named('a', '2'));
    pushSnapshot('a', named('a', '3'));
    expect(popSnapshot('a')!.name).toBe('3');
    expect(popSnapshot('a')!.name).toBe('2');
    expect(popSnapshot('a')!.name).toBe('1');
  });

  it('caps at 30 snapshots, dropping the oldest', () => {
    for (let i = 0; i < 35; i++) {
      pushSnapshot('a', named('a', String(i)));
    }
    expect(stackDepth('a')).toBe(30);
    // The newest is on top; popping should give the newest.
    expect(popSnapshot('a')!.name).toBe('34');
    // The bottom of the stack was 5 (since 0..4 were dropped).
    while (stackDepth('a') > 1) popSnapshot('a');
    expect(popSnapshot('a')!.name).toBe('5');
  });

  it('dedupes adjacent identical snapshots', () => {
    const c = named('a', 'Alpha');
    pushSnapshot('a', c);
    pushSnapshot('a', { ...c }); // structurally equal
    pushSnapshot('a', { ...c });
    expect(stackDepth('a')).toBe(1);
  });

  it('different ids have independent stacks', () => {
    pushSnapshot('a', named('a', 'A1'));
    pushSnapshot('b', named('b', 'B1'));
    expect(popSnapshot('a')!.name).toBe('A1');
    expect(canUndo('a')).toBe(false);
    expect(canUndo('b')).toBe(true);
    expect(popSnapshot('b')!.name).toBe('B1');
  });
});
