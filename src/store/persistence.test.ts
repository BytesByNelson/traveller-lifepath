// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAll,
  deleteCharacter,
  loadAllCharacters,
  loadCharacter,
  readIndex,
  saveCharacter,
  setStorageForTesting,
  type Storage,
} from './persistence';
import { newCharacter } from '../engine';

const memStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
};

describe('persistence', () => {
  beforeEach(() => {
    setStorageForTesting(memStorage());
  });

  it('round-trips a character through save/load', () => {
    const c = newCharacter('abc', 'Erik', 'human');
    saveCharacter(c);
    const loaded = loadCharacter('abc');
    expect(loaded).toEqual(c);
  });

  it('updates the index on save', () => {
    saveCharacter(newCharacter('a', 'Alpha', 'human'));
    saveCharacter(newCharacter('b', 'Beta', 'aslan'));
    const index = readIndex();
    expect(index).toHaveLength(2);
    expect(index.map((e) => e.id).sort()).toEqual(['a', 'b']);
    expect(index.find((e) => e.id === 'a')!.name).toBe('Alpha');
  });

  it('saving the same id twice updates rather than duplicates', () => {
    const c = newCharacter('a', 'Alpha', 'human');
    saveCharacter(c);
    saveCharacter({ ...c, name: 'Alphabet' });
    const index = readIndex();
    expect(index).toHaveLength(1);
    expect(index[0]!.name).toBe('Alphabet');
  });

  it('deleteCharacter removes from storage and index', () => {
    saveCharacter(newCharacter('a', 'Alpha', 'human'));
    saveCharacter(newCharacter('b', 'Beta', 'human'));
    deleteCharacter('a');
    expect(readIndex().map((e) => e.id)).toEqual(['b']);
    expect(loadCharacter('a')).toBeUndefined();
    expect(loadCharacter('b')).toBeDefined();
  });

  it('loadAllCharacters returns everything in the index', () => {
    saveCharacter(newCharacter('a', 'Alpha', 'human'));
    saveCharacter(newCharacter('b', 'Beta', 'aslan'));
    const all = loadAllCharacters();
    expect(all.map((c) => c.id).sort()).toEqual(['a', 'b']);
  });

  it('returns undefined for missing characters', () => {
    expect(loadCharacter('does-not-exist')).toBeUndefined();
  });

  it('returns undefined for malformed stored JSON', () => {
    setStorageForTesting({
      getItem: (k) => (k === 'traveller:char:bad' ? '{invalid json' : null),
      setItem: () => {},
      removeItem: () => {},
    });
    expect(loadCharacter('bad')).toBeUndefined();
  });

  it('returns undefined for stored data that fails migration', () => {
    const map = new Map<string, string>();
    map.set('traveller:char:bad', JSON.stringify({ schemaVersion: 1, id: 'bad' })); // missing required fields
    setStorageForTesting({
      getItem: (k) => map.get(k) ?? null,
      setItem: () => {},
      removeItem: () => {},
    });
    expect(loadCharacter('bad')).toBeUndefined();
  });

  it('clearAll wipes everything', () => {
    saveCharacter(newCharacter('a', 'Alpha', 'human'));
    saveCharacter(newCharacter('b', 'Beta', 'human'));
    clearAll();
    expect(readIndex()).toEqual([]);
    expect(loadCharacter('a')).toBeUndefined();
  });
});
