import type { Character } from '../types';
import { migrate } from './migrations';

const CHAR_KEY = (id: string) => `traveller:char:${id}`;
const INDEX_KEY = 'traveller:index';

export type IndexEntry = {
  id: string;
  name: string;
  species: Character['species'];
  lastModified: number;
};

/* ─────────── Storage abstraction ─────────── */

/**
 * A pluggable storage interface. Defaults to window.localStorage at runtime; tests
 * can substitute an in-memory implementation. Methods are sync to match localStorage.
 */
export type Storage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

let activeStorage: Storage | undefined;

const defaultStorage = (): Storage => {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  // Server / no DOM: return a no-op shim.
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

/** For tests: inject an alternate storage. Pass undefined to revert to default. */
export const setStorageForTesting = (s: Storage | undefined): void => {
  activeStorage = s;
};

const storage = (): Storage => activeStorage ?? defaultStorage();

/* ─────────── Index helpers ─────────── */

export function readIndex(): IndexEntry[] {
  const raw = storage().getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isIndexEntry);
  } catch {
    return [];
  }
}

const isIndexEntry = (x: unknown): x is IndexEntry =>
  typeof x === 'object' && x !== null &&
  typeof (x as IndexEntry).id === 'string' &&
  typeof (x as IndexEntry).name === 'string' &&
  typeof (x as IndexEntry).species === 'string' &&
  typeof (x as IndexEntry).lastModified === 'number';

function writeIndex(entries: IndexEntry[]): void {
  storage().setItem(INDEX_KEY, JSON.stringify(entries));
}

function upsertIndex(c: Character): void {
  const entries = readIndex();
  const idx = entries.findIndex((e) => e.id === c.id);
  const entry: IndexEntry = { id: c.id, name: c.name, species: c.species, lastModified: Date.now() };
  if (idx === -1) entries.push(entry);
  else entries[idx] = entry;
  writeIndex(entries);
}

function removeFromIndex(id: string): void {
  writeIndex(readIndex().filter((e) => e.id !== id));
}

/* ─────────── Character read/write ─────────── */

/** Persist a character. Updates the index. */
export function saveCharacter(c: Character): void {
  storage().setItem(CHAR_KEY(c.id), JSON.stringify(c));
  upsertIndex(c);
}

/**
 * Load a character by id. Returns undefined if missing or unmigratable.
 * Migration errors are silently swallowed at this layer; the import path
 * surfaces them via `loadCharacterStrict`.
 */
export function loadCharacter(id: string): Character | undefined {
  const raw = storage().getItem(CHAR_KEY(id));
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    const result = migrate(parsed);
    return result.ok ? result.character : undefined;
  } catch {
    return undefined;
  }
}

/** Load all characters listed in the index. Skips entries that fail to load. */
export function loadAllCharacters(): Character[] {
  return readIndex()
    .map((e) => loadCharacter(e.id))
    .filter((c): c is Character => c !== undefined);
}

/** Delete a character from storage and the index. */
export function deleteCharacter(id: string): void {
  storage().removeItem(CHAR_KEY(id));
  removeFromIndex(id);
}

/** Wipe everything (for tests). */
export function clearAll(): void {
  for (const e of readIndex()) storage().removeItem(CHAR_KEY(e.id));
  storage().removeItem(INDEX_KEY);
}
