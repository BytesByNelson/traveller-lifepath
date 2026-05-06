// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  assignFromPool,
  assignPoolInOrder,
  dieValue,
  newCharacter,
  rollCharacteristicsPool,
  scriptedRng,
  unassignToPool,
} from './index';
import { CHAR_CODES } from '../types';

describe('Characteristic pool assignment', () => {
  it('rollCharacteristicsPool fills wizardState.unassignedRolls with six 2D values and assigns nothing', () => {
    const c = newCharacter('id', 'Pooled', 'human');
    const dice = [
      dieValue(3), dieValue(4), // 7
      dieValue(5), dieValue(6), // 11
      dieValue(2), dieValue(2), // 4
      dieValue(6), dieValue(6), // 12
      dieValue(1), dieValue(1), // 2
      dieValue(4), dieValue(5), // 9
    ];
    const updated = rollCharacteristicsPool(c, scriptedRng(dice));
    expect(updated.wizardState?.unassignedRolls).toEqual([7, 11, 4, 12, 2, 9]);
    // No characteristic was assigned.
    for (const code of CHAR_CODES) {
      expect(updated.baseCharacteristics[code]).toBe(7);
    }
    // Six "Roll pool" entries appeared in the log.
    const poolEntries = updated.rollLog.filter((e) => e.context === 'Roll pool');
    expect(poolEntries).toHaveLength(6);
  });

  it('assignFromPool moves a value out of the pool, sets the char, and renames the matching log entry', () => {
    const c = newCharacter('id', 'Pooled', 'human');
    const rolled = rollCharacteristicsPool(
      c,
      scriptedRng([
        dieValue(3), dieValue(4), // 7
        dieValue(5), dieValue(6), // 11
        dieValue(2), dieValue(2), // 4
        dieValue(6), dieValue(6), // 12
        dieValue(1), dieValue(1), // 2
        dieValue(4), dieValue(5), // 9
      ]),
    );
    const assigned = assignFromPool(rolled, 'INT', 12);
    expect(assigned.baseCharacteristics.INT).toBe(12);
    expect(assigned.characteristics.INT).toBe(12);
    expect(assigned.wizardState?.unassignedRolls).toEqual([7, 11, 4, 2, 9]);
    // The matching pool log entry was relabelled — exactly one "Roll INT" entry, five "Roll pool" still.
    expect(assigned.rollLog.filter((e) => e.context === 'Roll INT')).toHaveLength(1);
    expect(assigned.rollLog.filter((e) => e.context === 'Roll pool')).toHaveLength(5);
  });

  it('assignFromPool with a value not in the pool is a no-op', () => {
    const c = newCharacter('id', 'Pooled', 'human');
    const rolled = rollCharacteristicsPool(
      c,
      scriptedRng(Array(12).fill(dieValue(4))), // all 8s
    );
    const before = rolled;
    const after = assignFromPool(rolled, 'STR', 11);
    expect(after).toEqual(before);
  });

  it('unassignToPool returns a value to the pool and resets the char to default', () => {
    const c = newCharacter('id', 'Pooled', 'human');
    const rolled = rollCharacteristicsPool(
      c,
      scriptedRng([
        dieValue(3), dieValue(4), // 7
        dieValue(5), dieValue(6), // 11
        dieValue(2), dieValue(2), // 4
        dieValue(6), dieValue(6), // 12
        dieValue(1), dieValue(1), // 2
        dieValue(4), dieValue(5), // 9
      ]),
    );
    const assigned = assignFromPool(rolled, 'STR', 12);
    const undone = unassignToPool(assigned, 'STR');
    expect(undone.baseCharacteristics.STR).toBe(7);
    expect(undone.wizardState?.unassignedRolls).toContain(12);
    // Log entry name reverted.
    expect(undone.rollLog.filter((e) => e.context === 'Roll STR')).toHaveLength(0);
    expect(undone.rollLog.filter((e) => e.context === 'Roll pool')).toHaveLength(6);
  });

  it('assignPoolInOrder drains the pool into chars in CHAR_CODES order', () => {
    const c = newCharacter('id', 'Pooled', 'human');
    const rolled = rollCharacteristicsPool(
      c,
      scriptedRng([
        dieValue(3), dieValue(4), // 7
        dieValue(5), dieValue(6), // 11
        dieValue(2), dieValue(2), // 4
        dieValue(6), dieValue(6), // 12
        dieValue(1), dieValue(1), // 2
        dieValue(4), dieValue(5), // 9
      ]),
    );
    const drained = assignPoolInOrder(rolled);
    expect(drained.baseCharacteristics).toEqual({ STR: 7, DEX: 11, END: 4, INT: 12, EDU: 2, SOC: 9 });
    expect(drained.wizardState?.unassignedRolls).toEqual([]);
  });

  it('rollCharacteristicsPool clears prior assignments on re-roll', () => {
    const c = newCharacter('id', 'Pooled', 'human');
    const first = rollCharacteristicsPool(c, scriptedRng(Array(12).fill(dieValue(4)))); // pool of six 8s
    const partial = assignFromPool(first, 'STR', 8); // STR = 8, pool [8,8,8,8,8]
    expect(partial.baseCharacteristics.STR).toBe(8);

    const second = rollCharacteristicsPool(partial, scriptedRng(Array(12).fill(dieValue(2)))); // six 4s
    expect(second.baseCharacteristics.STR).toBe(7); // reset
    expect(second.wizardState?.unassignedRolls).toEqual([4, 4, 4, 4, 4, 4]);
    // Old log entries from the first pool are gone — only the fresh six "Roll pool" entries.
    expect(second.rollLog.filter((e) => e.context === 'Roll pool')).toHaveLength(6);
    expect(second.rollLog.filter((e) => e.context === 'Roll STR')).toHaveLength(0);
  });

  it('rollCharacteristicsPool also rolls PSI separately when psionics is enabled', () => {
    let c = newCharacter('id', 'PsiPool', 'human');
    c = { ...c, wizardState: { ...(c.wizardState ?? { step: 'basics' }), psionicsEnabled: true } };
    const dice = [
      ...Array(12).fill(dieValue(4)), // six 8s in the pool
      dieValue(5), dieValue(4),       // PSI = 9
    ];
    const updated = rollCharacteristicsPool(c, scriptedRng(dice));
    expect(updated.wizardState?.unassignedRolls).toEqual([8, 8, 8, 8, 8, 8]);
    expect(updated.psi).toEqual({ max: 9, current: 9 });
  });
});
