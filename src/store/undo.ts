import type { Character } from '../types';

/**
 * In-memory undo stacks keyed by character id. Snapshots aren't persisted —
 * a page reload clears them, which matches the user's mental model of
 * "I just clicked something and want to step back".
 */

const MAX_STACK = 30;

type StackMap = Map<string, Character[]>;

const stacks: StackMap = new Map();

const stackFor = (id: string): Character[] => {
  let s = stacks.get(id);
  if (!s) {
    s = [];
    stacks.set(id, s);
  }
  return s;
};

/** True if the snapshot is structurally equal to the topmost entry on the stack. */
const isDuplicateOfTop = (id: string, snapshot: Character): boolean => {
  const s = stackFor(id);
  if (s.length === 0) return false;
  return JSON.stringify(s[s.length - 1]) === JSON.stringify(snapshot);
};

/**
 * Push the *previous* state onto the undo stack. Call this before applying a mutation.
 * Adjacent identical snapshots are deduplicated.
 */
export const pushSnapshot = (id: string, prev: Character): void => {
  if (isDuplicateOfTop(id, prev)) return;
  const s = stackFor(id);
  s.push(prev);
  if (s.length > MAX_STACK) s.shift();
};

/** Pop the most recent snapshot. Returns undefined if the stack is empty. */
export const popSnapshot = (id: string): Character | undefined => stackFor(id).pop();

export const canUndo = (id: string): boolean => stackFor(id).length > 0;

export const stackDepth = (id: string): number => stackFor(id).length;

export const clearUndo = (id: string): void => {
  stacks.delete(id);
};

/** Test-only: clear all stacks. */
export const resetUndoForTesting = (): void => {
  stacks.clear();
};
