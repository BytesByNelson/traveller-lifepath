export type CharCode = 'STR' | 'DEX' | 'END' | 'INT' | 'EDU' | 'SOC';

export const CHAR_CODES = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'] as const satisfies readonly CharCode[];

export const PHYSICAL_CHARS: readonly CharCode[] = ['STR', 'DEX', 'END'] as const;
export const MENTAL_CHARS: readonly CharCode[] = ['INT', 'EDU', 'SOC'] as const;

export const CHAR_MAX = 15;
