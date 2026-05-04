import { describe, it, expect } from 'vitest';
import { capCharValue, computeNewSkillLevel } from './cap';

describe('cap', () => {
  describe('computeNewSkillLevel', () => {
    it('rule level undefined: gain at 1 if absent, +1 if present', () => {
      expect(computeNewSkillLevel(undefined, undefined)).toBe(1);
      expect(computeNewSkillLevel(0, undefined)).toBe(1);
      expect(computeNewSkillLevel(1, undefined)).toBe(2);
      expect(computeNewSkillLevel(3, undefined)).toBe(4);
    });

    it('rule level N: set to max(current, N)', () => {
      expect(computeNewSkillLevel(0, 1)).toBe(1);
      expect(computeNewSkillLevel(2, 1)).toBe(2); // current already higher
      expect(computeNewSkillLevel(undefined, 2)).toBe(2);
    });

    it('caps at 4 during creation', () => {
      expect(computeNewSkillLevel(4, undefined)).toBe(4);
      expect(computeNewSkillLevel(3, 5)).toBe(4);
    });
  });

  describe('capCharValue', () => {
    it('caps at 15, surfacing overflow', () => {
      expect(capCharValue(14, 2)).toEqual({ value: 15, overflow: 1 });
      expect(capCharValue(15, 1)).toEqual({ value: 15, overflow: 1 });
      expect(capCharValue(10, -3)).toEqual({ value: 7, overflow: 0 });
      expect(capCharValue(2, -3)).toEqual({ value: 0, overflow: 0 });
    });
  });
});
