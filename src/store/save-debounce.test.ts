// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setStorageForTesting, type Storage } from './persistence';
import {
  resetStoreForTesting,
  setSaveDebounceForTesting,
  upsertCharacter,
} from './characters';
import { newCharacter } from '../engine';

const memStorage = (): Storage & { writes: number } => {
  const map = new Map<string, string>();
  let writes = 0;
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      writes += 1;
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    get writes() {
      return writes;
    },
  };
};

describe('upsertCharacter — debounced localStorage writes', () => {
  let storage: ReturnType<typeof memStorage>;

  beforeEach(() => {
    vi.useFakeTimers();
    storage = memStorage();
    setStorageForTesting(storage);
    resetStoreForTesting();
    setSaveDebounceForTesting(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    setSaveDebounceForTesting(false);
  });

  it('coalesces rapid upserts into a single localStorage flush', () => {
    let c = newCharacter('id', '', 'human');
    for (const ch of 'Nelson Boggs') {
      c = { ...c, name: c.name + ch };
      upsertCharacter(c);
    }
    // No writes yet — debounce hasn't fired.
    expect(storage.writes).toBe(0);
    vi.advanceTimersByTime(300);
    // Single character JSON write + single index write = 2 setItem calls total.
    expect(storage.writes).toBe(2);
  });

  it('flushes when pagehide fires (tab close / navigation)', () => {
    upsertCharacter(newCharacter('id', 'X', 'human'));
    expect(storage.writes).toBe(0);
    window.dispatchEvent(new Event('pagehide'));
    expect(storage.writes).toBe(2);
  });

  it('writes synchronously when debounce is disabled', () => {
    setSaveDebounceForTesting(false);
    upsertCharacter(newCharacter('id', 'X', 'human'));
    expect(storage.writes).toBe(2);
  });
});
