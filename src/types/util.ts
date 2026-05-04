export const assertNever = (x: never): never => {
  throw new Error(`Unhandled discriminant: ${JSON.stringify(x)}`);
};

export type DiceSpec = '1D' | '2D' | 'D3';
