/**
 * Dice utilities. The RNG is injectable so tests can drive deterministic sequences
 * without monkey-patching Math.random.
 */
export type Rng = () => number; // returns [0, 1)

export const defaultRng: Rng = Math.random;

const die = (rng: Rng) => 1 + Math.floor(rng() * 6);

export const roll1d = (rng: Rng = defaultRng): number => die(rng);
export const roll2d = (rng: Rng = defaultRng): { total: number; dice: [number, number] } => {
  const a = die(rng);
  const b = die(rng);
  return { total: a + b, dice: [a, b] };
};
export const rollD3 = (rng: Rng = defaultRng): number => 1 + Math.floor(rng() * 3);

export type DiceSpec = '1D' | '2D' | 'D3';

export const rollSpec = (spec: DiceSpec, rng: Rng = defaultRng): number => {
  switch (spec) {
    case '1D':
      return roll1d(rng);
    case '2D':
      return roll2d(rng).total;
    case 'D3':
      return rollD3(rng);
  }
};

/**
 * A scripted RNG for tests: returns the next value from a queue, throwing if empty.
 * Each value should be in [0, 1). Helpers below let tests express what they want
 * each die to land on.
 */
export const scriptedRng = (values: number[]): Rng => {
  let i = 0;
  return () => {
    if (i >= values.length) throw new Error('scriptedRng exhausted');
    return values[i++]!;
  };
};

/** Convert "I want this die to roll N (1..6)" into the [0,1) value used by die(). */
export const dieValue = (n: number): number => {
  if (n < 1 || n > 6) throw new Error(`dieValue out of range: ${n}`);
  // die() = 1 + floor(rng * 6); we want floor(rng * 6) === n - 1, so rng in [(n-1)/6, n/6).
  return (n - 1) / 6 + 0.01; // a hair above the lower bound, safely inside the bucket.
};

/** Convert "I want a D3 to roll N (1..3)". */
export const d3Value = (n: number): number => {
  if (n < 1 || n > 3) throw new Error(`d3Value out of range: ${n}`);
  return (n - 1) / 3 + 0.01;
};
