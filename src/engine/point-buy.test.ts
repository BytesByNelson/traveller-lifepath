// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  newCharacter,
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  setPointBuyCharacteristic,
} from './index';
import { CHAR_CODES } from '../types';

describe('Point-buy stat method', () => {
  it('exports a 42-point budget with 2..12 bounds (matches the BasicsStep copy)', () => {
    expect(POINT_BUY_BUDGET).toBe(42);
    expect(POINT_BUY_MIN).toBe(2);
    expect(POINT_BUY_MAX).toBe(12);
  });

  it('default newCharacter values already total the budget (each stat at 7)', () => {
    const c = newCharacter('id', 'Allocator', 'human');
    const total = CHAR_CODES.reduce((sum, code) => sum + c.baseCharacteristics[code], 0);
    expect(total).toBe(POINT_BUY_BUDGET);
  });

  it('setPointBuyCharacteristic updates the value and applies species modifiers', () => {
    const c = newCharacter('id', 'Allocator', 'human');
    const updated = setPointBuyCharacteristic(c, 'STR', 10);
    expect(updated.baseCharacteristics.STR).toBe(10);
    expect(updated.characteristics.STR).toBe(10); // human: no modifiers
  });

  it('setPointBuyCharacteristic replaces the prior log entry for that stat (no accumulation)', () => {
    const c = newCharacter('id', 'Allocator', 'human');
    let next = setPointBuyCharacteristic(c, 'STR', 9);
    next = setPointBuyCharacteristic(next, 'STR', 11);
    next = setPointBuyCharacteristic(next, 'STR', 8);
    const strLogs = next.rollLog.filter((e) => e.context === 'Set STR (point-buy)');
    expect(strLogs).toHaveLength(1);
    expect(strLogs[0]!.result).toBe(8);
  });

  it('setPointBuyCharacteristic on different stats keeps each entry distinct', () => {
    const c = newCharacter('id', 'Allocator', 'human');
    let next = setPointBuyCharacteristic(c, 'STR', 9);
    next = setPointBuyCharacteristic(next, 'DEX', 10);
    next = setPointBuyCharacteristic(next, 'INT', 11);
    const pbLogs = next.rollLog.filter((e) => e.context.endsWith('(point-buy)'));
    expect(pbLogs).toHaveLength(3);
    expect(pbLogs.map((e) => e.context).sort()).toEqual([
      'Set DEX (point-buy)',
      'Set INT (point-buy)',
      'Set STR (point-buy)',
    ]);
  });

  it('species modifiers apply on top of the point-buy base value', () => {
    let c = newCharacter('id', 'Vargr', 'vargr'); // vargr modifier: STR-1, DEX+1, END-1
    c = setPointBuyCharacteristic(c, 'STR', 10);
    expect(c.baseCharacteristics.STR).toBe(10);
    // The species modifier applies to the displayed (live) characteristic, not the base.
    // Vargr STR -1 → 9.
    expect(c.characteristics.STR).toBe(9);
  });
});
