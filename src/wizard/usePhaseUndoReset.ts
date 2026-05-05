import { useEffect, useRef } from 'react';
import type { Character } from '../types';
import { debug } from '../debug';

/**
 * Wizard steps keep their working `phase` in local React state — `engine` snapshots,
 * outcome cards, prompt cursors. The `useCharacterWithUndo` snapshot stack only
 * captures the Character, so when the user clicks Undo the character pops to a prior
 * state but local phase keeps pointing at the post-undo screen — leaving the wizard
 * showing stale outcome data that no longer matches the character.
 *
 * This hook detects when character history "shrinks" between renders (rollLog,
 * careerHistory, or backgroundSkills counts go down — exactly what an Undo causes)
 * and calls the supplied reset callback. Wizard steps pass a callback that puts the
 * phase back at a safe default (choose / pick_career) so the player always lands on
 * a coherent screen they can navigate forward from.
 *
 * Tradeoff: undo doesn't restore the prior in-flight prompt cursor — it walks you
 * back to the picker. That's the simplest correct behaviour and matches what users
 * actually want (resume choosing, not "redo this exact roll prompt").
 */
export function usePhaseUndoReset(character: Character, reset: () => void): void {
  const lastSeen = useRef({
    rollLog: character.rollLog.length,
    careerHistory: character.careerHistory.length,
    backgroundSkills: character.backgroundSkills.length,
  });

  useEffect(() => {
    const now = {
      rollLog: character.rollLog.length,
      careerHistory: character.careerHistory.length,
      backgroundSkills: character.backgroundSkills.length,
    };
    const shrank =
      now.rollLog < lastSeen.current.rollLog ||
      now.careerHistory < lastSeen.current.careerHistory ||
      now.backgroundSkills < lastSeen.current.backgroundSkills;
    if (shrank) {
      debug('wizard:undo-reset', 'character history shrank — resetting wizard phase', {
        before: lastSeen.current,
        after: now,
      });
      reset();
    }
    lastSeen.current = now;
  }, [
    character.rollLog.length,
    character.careerHistory.length,
    character.backgroundSkills.length,
    reset,
  ]);
}
