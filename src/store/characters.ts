import { useSyncExternalStore } from 'react';
import type { Character } from '../types';
import {
  deleteCharacter as deleteFromStorage,
  loadAllCharacters,
  loadCharacter,
  readIndex,
  saveCharacter,
  type IndexEntry,
} from './persistence';

/**
 * In-memory cache backed by localStorage. Reads on first access, writes through
 * synchronously on every mutation. The cache is the source of truth for UI subscribers;
 * persistence runs alongside it so reloads recover state.
 */

type Listener = () => void;

const cache = {
  characters: new Map<string, Character>(),
  loaded: false,
  listeners: new Set<Listener>(),
  /** Cached snapshot for useCharacterList. Invalidated on every upsert/delete. */
  listSnapshot: undefined as Character[] | undefined,
};

const invalidateListSnapshot = (): void => {
  cache.listSnapshot = undefined;
};

const getListSnapshot = (): Character[] => {
  if (!cache.listSnapshot) {
    cache.listSnapshot = Array.from(cache.characters.values());
  }
  return cache.listSnapshot;
};

const ensureLoaded = (): void => {
  if (cache.loaded) return;
  for (const c of loadAllCharacters()) {
    cache.characters.set(c.id, c);
  }
  cache.loaded = true;
};

const emit = (): void => {
  for (const l of cache.listeners) l();
};

const subscribe = (l: Listener): (() => void) => {
  cache.listeners.add(l);
  return () => {
    cache.listeners.delete(l);
  };
};

/** Drop the cache so subsequent reads hit storage. Test-only. */
export const resetStoreForTesting = (): void => {
  cache.characters.clear();
  cache.loaded = false;
  cache.listeners.clear();
  cache.listSnapshot = undefined;
};

export const upsertCharacter = (c: Character): void => {
  ensureLoaded();
  cache.characters.set(c.id, c);
  saveCharacter(c);
  invalidateListSnapshot();
  emit();
};

export const deleteCharacter = (id: string): void => {
  ensureLoaded();
  cache.characters.delete(id);
  deleteFromStorage(id);
  invalidateListSnapshot();
  emit();
};

export const getCharacter = (id: string): Character | undefined => {
  ensureLoaded();
  return cache.characters.get(id) ?? loadCharacter(id);
};

export const listCharacters = (): Character[] => {
  ensureLoaded();
  return Array.from(cache.characters.values());
};

export const listCharacterIndex = (): IndexEntry[] => {
  // Index is always read fresh — it lives in storage and cache may be stale on cross-tab edits.
  return readIndex();
};

export const useCharacter = (id: string): [Character | undefined, (c: Character) => void] => {
  const character = useSyncExternalStore(
    subscribe,
    () => {
      ensureLoaded();
      return cache.characters.get(id);
    },
    () => undefined,
  );
  const set = (c: Character) => upsertCharacter(c);
  return [character, set];
};

const EMPTY_LIST: Character[] = [];

export const useCharacterList = (): Character[] => {
  return useSyncExternalStore(
    subscribe,
    () => {
      ensureLoaded();
      return getListSnapshot();
    },
    () => EMPTY_LIST,
  );
};
