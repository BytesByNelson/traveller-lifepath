import { useSyncExternalStore } from 'react';
import type { Character } from '../types';
import { debug } from '../debug';
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

const CHAR_KEY_PREFIX = 'traveller:char:';
const INDEX_KEY = 'traveller:index';

let storageListenerAttached = false;

const attachStorageListener = (): void => {
  if (storageListenerAttached) return;
  if (typeof window === 'undefined') return;
  storageListenerAttached = true;
  window.addEventListener('storage', (e: StorageEvent) => {
    if (!e.key) return;
    if (e.key.startsWith(CHAR_KEY_PREFIX)) {
      const id = e.key.slice(CHAR_KEY_PREFIX.length);
      const c = loadCharacter(id);
      if (c) {
        cache.characters.set(id, c);
      } else {
        cache.characters.delete(id);
      }
      invalidateListSnapshot();
      emit();
    } else if (e.key === INDEX_KEY) {
      // Index changed in another tab — reload everything.
      cache.characters.clear();
      for (const c of loadAllCharacters()) cache.characters.set(c.id, c);
      invalidateListSnapshot();
      emit();
    }
  });
};

const ensureLoaded = (): void => {
  if (cache.loaded) return;
  for (const c of loadAllCharacters()) {
    cache.characters.set(c.id, c);
  }
  cache.loaded = true;
  attachStorageListener();
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
  const prev = cache.characters.get(c.id);
  cache.characters.set(c.id, c);
  saveCharacter(c);
  invalidateListSnapshot();
  emit();
  debug('store', 'upsert', {
    id: c.id,
    rollLogDelta: c.rollLog.length - (prev?.rollLog.length ?? 0),
    rollLogTail: c.rollLog.slice(-3).map((r) => ({ context: r.context, natural: r.natural, result: r.result, success: r.success })),
    chars: c.characteristics,
    skillCount: c.backgroundSkills.length,
    connections: {
      contacts: c.connections.contacts.length,
      allies: c.connections.allies.length,
      rivals: c.connections.rivals.length,
      enemies: c.connections.enemies.length,
    },
    wizardStep: c.wizardState?.step,
  });
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
