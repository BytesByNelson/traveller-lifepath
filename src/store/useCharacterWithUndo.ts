import { useCallback, useSyncExternalStore } from 'react';
import type { Character } from '../types';
import { upsertCharacter, useCharacter } from './characters';
import { canUndo as canUndoRaw, popSnapshot, pushSnapshot, stackDepth } from './undo';

const subscribers = new Map<string, Set<() => void>>();

const emit = (id: string): void => {
  subscribers.get(id)?.forEach((l) => l());
};

const subscribe = (id: string) => (l: () => void) => {
  let set = subscribers.get(id);
  if (!set) {
    set = new Set();
    subscribers.set(id, set);
  }
  set.add(l);
  return () => set!.delete(l);
};

/**
 * Like useCharacter, but every setCharacter call records a snapshot of the
 * previous state on the in-memory undo stack. Returns an undo() helper.
 */
export const useCharacterWithUndo = (
  id: string,
): {
  character: Character | undefined;
  setCharacter: (next: Character) => void;
  undo: () => void;
  canUndo: boolean;
  depth: number;
} => {
  const [character] = useCharacter(id);

  const setCharacter = useCallback(
    (next: Character) => {
      if (character) pushSnapshot(id, character);
      upsertCharacter(next);
      emit(id);
    },
    [id, character],
  );

  const undo = useCallback(() => {
    const prev = popSnapshot(id);
    if (prev) {
      upsertCharacter(prev);
      emit(id);
    }
  }, [id]);

  // Subscribe to undo-stack changes (separately from character updates) so the
  // disabled state of the undo button stays accurate.
  const depth = useSyncExternalStore(
    subscribe(id),
    () => stackDepth(id),
    () => 0,
  );

  return {
    character,
    setCharacter,
    undo,
    canUndo: canUndoRaw(id),
    depth,
  };
};
