import { describe, it, expect } from 'vitest';
import { d3Value, dieValue, roll1d, roll2d, rollD3, rollSpec, scriptedRng } from './dice';

describe('dice', () => {
  it('dieValue returns a value that lands on the requested face', () => {
    for (let n = 1; n <= 6; n++) {
      const rng = scriptedRng([dieValue(n)]);
      expect(roll1d(rng)).toBe(n);
    }
  });

  it('roll2d sums two faces and reports the dice', () => {
    const rng = scriptedRng([dieValue(3), dieValue(5)]);
    const r = roll2d(rng);
    expect(r.total).toBe(8);
    expect(r.dice).toEqual([3, 5]);
  });

  it('rollD3 covers 1..3', () => {
    for (let n = 1; n <= 3; n++) {
      const rng = scriptedRng([d3Value(n)]);
      expect(rollD3(rng)).toBe(n);
    }
  });

  it('rollSpec routes to the correct die', () => {
    expect(rollSpec('1D', scriptedRng([dieValue(4)]))).toBe(4);
    expect(rollSpec('2D', scriptedRng([dieValue(6), dieValue(6)]))).toBe(12);
    expect(rollSpec('D3', scriptedRng([d3Value(2)]))).toBe(2);
  });

  it('scriptedRng throws when exhausted', () => {
    const rng = scriptedRng([0.1]);
    rng();
    expect(() => rng()).toThrow(/exhausted/);
  });
});
